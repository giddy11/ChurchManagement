import { useRegisterSW } from "virtual:pwa-register/react";

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log("SW registered: " + swUrl);
      // Check for updates every hour
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-white p-4 shadow-lg border border-gray-200 max-w-sm">
      <p className="text-sm text-gray-700 mb-3">
        A new version is available.
      </p>
      <div className="flex gap-2">
        <button
          className="rounded bg-indigo-500 px-3 py-1.5 text-sm text-white hover:bg-indigo-600"
          onClick={() => updateServiceWorker(true)}
        >
          Update
        </button>
        <button
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          onClick={() => setNeedRefresh(false)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
