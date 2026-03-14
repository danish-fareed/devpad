import { useEffect, useMemo, useState } from "react";
import * as commands from "@/lib/commands";
import type { EditableProjectFile, MergedVariable } from "@/lib/types";
import { VariableDetailDrawer } from "./VariableDetailDrawer";
import { useEnvironmentStore } from "@/stores/environmentStore";
import { useProjectStore } from "@/stores/projectStore";
import { VariableRow } from "./VariableRow";
import { VariableFilters } from "./VariableFilters";
import { buildEditableVariable } from "@/lib/buildEditableVariable";

/**
 * Variable table — macOS-style list with filters, column headers, and detail inspector.
 */
export function VariableList() {
  const activeProject = useProjectStore((s) => s.activeProject);
  const refreshActiveProject = useProjectStore((s) => s.refreshActiveProject);
  const { loadResult, activeEnv, isLoading, getFilteredVariables } =
    useEnvironmentStore();
  const loadEnvironment = useEnvironmentStore((s) => s.loadEnvironment);
  const variables = getFilteredVariables();
  const [selectedVariableKey, setSelectedVariableKey] = useState<string | null>(null);
  const [editableFiles, setEditableFiles] = useState<EditableProjectFile[]>([]);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedVariable = useMemo(
    () => loadResult?.variables.find((v) => v.key === selectedVariableKey) ?? null,
    [loadResult?.variables, selectedVariableKey],
  );

  const selectedEditableVariable = useMemo(() => {
    if (!selectedVariable) return null;
    return buildEditableVariable(selectedVariable, editableFiles, fileContents);
  }, [selectedVariable, editableFiles, fileContents]);

  useEffect(() => {
    setSelectedVariableKey(null);
    setEditableFiles([]);
    setFileContents({});
    setEditorLoading(false);
    setEditorError(null);
    setSaveError(null);
    setIsSaving(false);
  }, [activeProject?.id]);

  useEffect(() => {
    if (!activeProject || !selectedVariableKey) return;

    let cancelled = false;

    const loadEditorFiles = async () => {
      setEditorLoading(true);
      setEditorError(null);
      setSaveError(null);

      try {
        const files = await commands.listEditableProjectFiles(activeProject.path);
        if (files.length === 0) {
          throw new Error("No editable project env files are available.");
        }
        const contents = await Promise.all(
          files.map(async (file) => [
            file.relativePath,
            await commands.readProjectFile(activeProject.path, file.relativePath),
          ] as const),
        );

        if (cancelled) return;

        setEditableFiles(files);
        setFileContents(Object.fromEntries(contents));
      } catch (error) {
        if (cancelled) return;
        setEditorError(String(error));
      } finally {
        if (!cancelled) setEditorLoading(false);
      }
    };

    loadEditorFiles().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [activeProject, selectedVariableKey]);

  const handleSelectVariable = (variable: MergedVariable) => {
    setSelectedVariableKey(variable.key);
  };

  const handleCloseEditor = () => {
    if (isSaving) return;
    setSelectedVariableKey(null);
    setSaveError(null);
    setEditorError(null);
  };

  const handleSaveEnvFile = async ({
    relativePath,
    content,
  }: {
    relativePath: string;
    content: string;
  }) => {
    if (!activeProject || !selectedVariableKey) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await commands.writeProjectFile(activeProject.path, relativePath, content);
      setFileContents((current) => ({ ...current, [relativePath]: content }));
      await refreshActiveProject();
      await loadEnvironment(activeProject.path, activeEnv);
      setSaveError(null);
    } catch (error) {
      setSaveError(String(error));
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSchemaFile = async ({ content }: { content: string }) => {
    if (!activeProject || !selectedVariableKey) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await commands.writeProjectFile(activeProject.path, ".env.schema", content);
      setFileContents((current) => ({ ...current, [".env.schema"]: content }));
      await refreshActiveProject();
      await loadEnvironment(activeProject.path, activeEnv);
      setSaveError(null);
    } catch (error) {
      setSaveError(String(error));
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  if (activeProject?.status === "migrationNeeded") return null;
  if (!loadResult && !isLoading) return null;

  return (
    <>
      <div>
        {/* Header with filters */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Variables — {activeEnv}
          </h3>
          <VariableFilters />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="border border-border-light rounded-lg p-8 text-center bg-surface">
            <p className="text-[13px] text-text-muted animate-pulse-soft">Loading variables...</p>
          </div>
        )}

        {/* Variable table */}
        {!isLoading && loadResult && (
          <div className="border border-border-light rounded-lg overflow-hidden bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {/* Column headers */}
            <div className="grid grid-cols-[200px_1fr_80px_90px] px-4 py-2 bg-surface-secondary border-b border-border-light gap-3">
              <span className="text-[11px] font-medium text-text-muted">
                Key
              </span>
              <span className="text-[11px] font-medium text-text-muted">
                Value
              </span>
              <span className="text-[11px] font-medium text-text-muted">
                Type
              </span>
              <span className="text-[11px] font-medium text-text-muted text-right">
                Status
              </span>
            </div>

            {/* Variable rows */}
            {variables.length === 0 ? (
              <div className="px-4 py-8 text-center text-[13px] text-text-muted">
                No variables match the current filter.
              </div>
            ) : (
              variables.map((variable, index) => (
                <div key={variable.key}>
                  {index > 0 && <div className="h-px bg-border-light" />}
                  <VariableRow
                    variable={variable}
                    onSelect={handleSelectVariable}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {editorError && selectedVariable && (
          <div className="mt-3 rounded-lg border border-danger/20 bg-danger-light px-3 py-2.5 text-[12px] text-danger-dark">
            {editorError}
          </div>
        )}
      </div>

      {selectedEditableVariable && !editorLoading && editableFiles.length > 0 && (
        <VariableDetailDrawer
          variable={selectedEditableVariable}
          activeEnv={activeEnv}
          editableFiles={editableFiles}
          fileContents={fileContents}
          isSaving={isSaving}
          saveError={saveError}
          onClose={handleCloseEditor}
          onSaveEnvFile={handleSaveEnvFile}
          onSaveSchemaFile={handleSaveSchemaFile}
        />
      )}

      {selectedVariable && editorLoading && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/15 backdrop-blur-sm">
          <div className="h-full w-full max-w-[520px] border-l border-border-light bg-surface shadow-[-8px_0_40px_rgba(0,0,0,0.08)] p-6 animate-slide-in-right">
            <div className="text-[13px] text-text-secondary animate-pulse-soft">Loading variable detail...</div>
            {editorError && (
              <div className="mt-3 rounded-lg border border-danger/20 bg-danger-light px-3 py-2.5 text-[12px] text-danger-dark">
                {editorError}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
