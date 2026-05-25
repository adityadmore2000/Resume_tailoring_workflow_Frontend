"use client";

import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useTheme, type ThemePreference } from "@/components/theme/theme-provider";

type Provider = "ollama" | "openai" | "openai_compatible";

type SettingsState = {
  provider: Provider;
  ollama: { host: string; model: string; embedModel: string };
  openai: { apiKey: string; model: string; embedModel: string };
  openaiCompatible: { baseUrl: string; apiKey: string; model: string; embedModel: string };
};

const STORAGE_KEY = "app_settings_v1";

const defaultState: SettingsState = {
  provider: "ollama",
  ollama: { host: "http://localhost:11434", model: "llama3.2:3b", embedModel: "nomic-embed-text" },
  openai: { apiKey: "", model: "gpt-4o-mini", embedModel: "text-embedding-3-small" },
  openaiCompatible: { baseUrl: "", apiKey: "", model: "", embedModel: "" }
};

function maskKey(k: string) {
  if (!k) return "";
  if (k.length <= 6) return "••••••";
  return `${k.slice(0, 2)}••••••${k.slice(-2)}`;
}

export default function SettingsPage() {
  const { preference, setPreference } = useTheme();
  const [state, setState] = React.useState<SettingsState>(defaultState);
  const [saved, setSaved] = React.useState(false);

  // Masked display only (do not re-render stored secrets in plaintext).
  const [openaiKeyInput, setOpenaiKeyInput] = React.useState("");
  const [openaiCompatKeyInput, setOpenaiCompatKeyInput] = React.useState("");

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SettingsState;
        setState({ ...defaultState, ...parsed });
      }
    } catch {}
  }, []);

  function save() {
    const next: SettingsState = {
      ...state,
      openai: { ...state.openai, apiKey: openaiKeyInput || state.openai.apiKey },
      openaiCompatible: { ...state.openaiCompatible, apiKey: openaiCompatKeyInput || state.openaiCompatible.apiKey }
    };
    setState(next);
    setOpenaiKeyInput("");
    setOpenaiCompatKeyInput("");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const providerOptions = [
    { value: "ollama", label: "ollama" },
    { value: "openai", label: "openai" },
    { value: "openai_compatible", label: "openai_compatible" }
  ] as const;

  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" }
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-mutedForeground">Configure LLM provider settings and theme preference.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Switch between light, dark, and system preference.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-w-xs">
            <Select
              value={preference}
              onChange={(v) => setPreference(v as ThemePreference)}
              placeholder="Theme preference"
              options={themeOptions as any}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LLM Provider</CardTitle>
          <CardDescription>
            Frontend never calls providers directly. For now, these settings are stored locally for dev; runtime switching
            may require a backend restart.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs">
            <Select
              value={state.provider}
              onChange={(v) => setState((s) => ({ ...s, provider: v as Provider }))}
              placeholder="Select provider"
              options={providerOptions as any}
            />
          </div>

          {state.provider === "ollama" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <div className="text-sm font-medium">OLLAMA_HOST</div>
                <Input value={state.ollama.host} onChange={(e) => setState((s) => ({ ...s, ollama: { ...s.ollama, host: e.target.value } }))} />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium">OLLAMA_MODEL</div>
                <Input value={state.ollama.model} onChange={(e) => setState((s) => ({ ...s, ollama: { ...s.ollama, model: e.target.value } }))} />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium">OLLAMA_EMBED_MODEL</div>
                <Input
                  value={state.ollama.embedModel}
                  onChange={(e) => setState((s) => ({ ...s, ollama: { ...s.ollama, embedModel: e.target.value } }))}
                />
              </div>
            </div>
          ) : null}

          {state.provider === "openai" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <div className="text-sm font-medium">OPENAI_API_KEY</div>
                <Input
                  value={openaiKeyInput}
                  onChange={(e) => setOpenaiKeyInput(e.target.value)}
                  placeholder={state.openai.apiKey ? maskKey(state.openai.apiKey) : "sk-..."}
                  type="password"
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium">OPENAI_MODEL</div>
                <Input value={state.openai.model} onChange={(e) => setState((s) => ({ ...s, openai: { ...s.openai, model: e.target.value } }))} />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium">OPENAI_EMBED_MODEL</div>
                <Input
                  value={state.openai.embedModel}
                  onChange={(e) => setState((s) => ({ ...s, openai: { ...s.openai, embedModel: e.target.value } }))}
                />
              </div>
            </div>
          ) : null}

          {state.provider === "openai_compatible" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <div className="text-sm font-medium">OPENAI_COMPATIBLE_BASE_URL</div>
                <Input
                  value={state.openaiCompatible.baseUrl}
                  onChange={(e) =>
                    setState((s) => ({ ...s, openaiCompatible: { ...s.openaiCompatible, baseUrl: e.target.value } }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium">OPENAI_COMPATIBLE_API_KEY</div>
                <Input
                  value={openaiCompatKeyInput}
                  onChange={(e) => setOpenaiCompatKeyInput(e.target.value)}
                  placeholder={state.openaiCompatible.apiKey ? maskKey(state.openaiCompatible.apiKey) : "hf_..."}
                  type="password"
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium">OPENAI_COMPATIBLE_MODEL</div>
                <Input
                  value={state.openaiCompatible.model}
                  onChange={(e) =>
                    setState((s) => ({ ...s, openaiCompatible: { ...s.openaiCompatible, model: e.target.value } }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium">OPENAI_COMPATIBLE_EMBED_MODEL</div>
                <Input
                  value={state.openaiCompatible.embedModel}
                  onChange={(e) =>
                    setState((s) => ({ ...s, openaiCompatible: { ...s.openaiCompatible, embedModel: e.target.value } }))
                  }
                />
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <Button onClick={save}>{saved ? "Saved" : "Save Settings"}</Button>
            <div className="text-xs text-mutedForeground">
              Runtime switching may not be enabled yet. If changes don’t apply, update backend env vars and restart.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

