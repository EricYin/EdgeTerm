import { useEffect, useState } from "react";

import * as api from "../api";
import { useActiveTab, useStore } from "../store";
import { isFileSession } from "../types";
import { Icon } from "./icons";

/** The folder half of a recording's path, for the Reveal click. */
const parentDir = (path: string): string =>
  path.replace(/[\\/][^\\/]*$/, "") || path;

export function StatusBar() {
  const tab = useActiveTab();
  const status = useStore((s) => s.status);
  const error = useStore((s) => s.error);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${clock.getFullYear()}/${clock.getMonth() + 1}/${clock.getDate()} ${pad(
    clock.getHours(),
  )}:${pad(clock.getMinutes())}`;

  const recording = tab?.state === "connected" ? tab.info.recording : null;

  return (
    <div className="statusbar">
      <span className={`status-item${error ? " is-error" : ""}`}>
        {error ?? status}
      </span>
      <div className="status-spacer" />
      {tab && (
        <>
          {recording && (
            <button
              type="button"
              className="status-item status-recording"
              title={`Recording to ${recording} — click to open the folder`}
              onClick={() =>
                void api.openLocalPath(parentDir(recording)).catch(() => undefined)
              }
            >
              <Icon name="record" />
              REC
            </button>
          )}
          {isFileSession(tab.info.kind) ? (
            <span className="status-item">Dual-pane file transfer</span>
          ) : (
            <span className="status-item">
              Window {tab.rows}×{tab.cols}
            </span>
          )}
          <span className="status-item">{tab.info.protocol}</span>
        </>
      )}
      <span className="status-item">{stamp}</span>
    </div>
  );
}
