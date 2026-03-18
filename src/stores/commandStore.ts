import { create } from "zustand";
import type {
  DiscoveredCommand,
  ProjectScan,
  RunningCommandInfo,
  CommandType,
} from "@/lib/types";
import * as commands from "@/lib/commands";

interface CommandState {
  scan: ProjectScan | null;
  scanError: string | null;
  isScanning: boolean;
  selectedNodeId: string | null;
  selectedScopePath: string;
  running: Record<string, RunningCommandInfo>;
  commandErrors: Record<string, string[]>;
  logBuffers: Record<string, string[]>;

  scanProject: (cwd: string) => Promise<void>;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedScopePath: (scopePath: string) => void;
  getVisibleCommands: () => DiscoveredCommand[];
  launchCommand: (
    command: DiscoveredCommand,
    envName: string,
  ) => Promise<void>;
  stopCommand: (commandId: string) => void;
  clearError: (commandId: string) => void;
  reset: () => void;
}

function statusFromType(type: CommandType): RunningCommandInfo["status"] {
  if (type === "cloud-job") {
    return "running";
  }
  return "running";
}

export const useCommandStore = create<CommandState>((set, get) => ({
  scan: null,
  scanError: null,
  isScanning: false,
  selectedNodeId: null,
  selectedScopePath: "all",
  running: {},
  commandErrors: {},
  logBuffers: {},

  scanProject: async (cwd: string) => {
    set({ isScanning: true, scanError: null });
    try {
      const scan = await commands.scanProject(cwd);
      const selectedNodeId = get().selectedNodeId ?? scan.rootNodeId;
      const nodeExists = scan.nodes.some((n) => n.id === selectedNodeId);
      set({
        scan,
        isScanning: false,
        scanError: null,
        selectedNodeId: nodeExists ? selectedNodeId : scan.rootNodeId,
      });
    } catch (e) {
      console.error("Failed to scan project:", e);
      set({ isScanning: false, scanError: String(e) });
    }
  },

  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

  setSelectedScopePath: (scopePath) => set({ selectedScopePath: scopePath }),

  getVisibleCommands: () => [],

  launchCommand: async (command, envName) => {
    const commandId = command.id;

    set((state) => {
      const errors = { ...state.commandErrors };
      delete errors[commandId];
      return { commandErrors: errors };
    });

    try {
      const cwd = get().scan?.nodes.find((n) => n.id === command.nodeId)?.path;
      if (!cwd) {
        throw new Error("Unable to resolve command working directory");
      }

      const commandLine = [command.command, ...command.args].join(" ");
      await commands.runInTerminal(cwd, commandLine);

      set((state) => ({
        running: {
          ...state.running,
          [commandId]: {
            commandId,
            sessionId: "",
            status: statusFromType(command.commandType),
            startedAt: Date.now(),
            envName,
            logPeek: [],
          },
        },
      }));
    } catch (e) {
      set((state) => ({
        commandErrors: {
          ...state.commandErrors,
          [commandId]: [String(e)],
        },
      }));
    }
  },

  stopCommand: (commandId: string) => {
    set((state) => {
      const r = { ...state.running };
      delete r[commandId];
      return { running: r };
    });
  },

  clearError: (commandId: string) => {
    set((state) => {
      const errors = { ...state.commandErrors };
      delete errors[commandId];
      const running = { ...state.running };
      delete running[commandId];
      return { commandErrors: errors, running };
    });
  },

  reset: () => {
    set({
      scan: null,
      scanError: null,
      isScanning: false,
      selectedNodeId: null,
      selectedScopePath: "all",
      running: {},
      commandErrors: {},
      logBuffers: {},
    });
  },
}));
