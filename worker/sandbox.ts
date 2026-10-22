import { spawn } from "child_process";
import { sanitizeLogs } from "@/lib/openai";

export interface SandboxExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  timedOut: boolean;
}

export class Sandbox {
  static async executeCommand(
    command: string,
    args: string[] = [],
    options: { cwd?: string; timeoutMs?: number; env?: NodeJS.ProcessEnv } = {}
  ): Promise<SandboxExecutionResult> {
    const timeoutMs = options.timeoutMs || 45000;
    const startTime = Date.now();

    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      let timedOut = false;

      // Safe clean environment: exclude production database credentials and sensitive secrets
      const safeEnv: NodeJS.ProcessEnv = {
        PATH: process.env.PATH,
        HOME: process.env.HOME || process.env.USERPROFILE,
        NODE_ENV: "test",
        CI: "true",
        ...options.env,
      };

      const child = spawn(command, args, {
        cwd: options.cwd || process.cwd(),
        env: safeEnv,
        shell: true,
      });

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGTERM");
        setTimeout(() => {
          if (!child.killed) child.kill("SIGKILL");
        }, 2000);
      }, timeoutMs);

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
        // Limit stdout size in memory to 500KB
        if (stdout.length > 500000) {
          stdout = stdout.slice(-250000);
        }
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
        if (stderr.length > 500000) {
          stderr = stderr.slice(-250000);
        }
      });

      child.on("error", (err) => {
        clearTimeout(timer);
        resolve({
          stdout: sanitizeLogs(stdout),
          stderr: sanitizeLogs(`${stderr}\nProcess error: ${err.message}`),
          exitCode: 1,
          durationMs: Date.now() - startTime,
          timedOut,
        });
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        resolve({
          stdout: sanitizeLogs(stdout),
          stderr: sanitizeLogs(stderr),
          exitCode: code ?? (timedOut ? 124 : 0),
          durationMs: Date.now() - startTime,
          timedOut,
        });
      });
    });
  }
}
