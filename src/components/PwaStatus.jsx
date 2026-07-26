import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  RefreshCw,
  WifiOff,
  X,
} from 'lucide-react';
import {
  applyServiceWorkerUpdate,
  getPwaRuntimeState,
  requestPwaInstall,
} from '../registerSW.js';

const FALLBACK_LABELS = {
  ja: {
    updateTitle: '更新があります',
    updateBody:
      '新しいバージョンを利用できます。更新するとページを再読み込みします。',
    updateButton: '更新する',
    installTitle: 'アプリとして利用できます',
    installBody:
      'ホーム画面へ追加すると、ブラウザを開かずに起動できます。',
    installButton: 'インストール',
    offlineTitle: 'オフラインです',
    offlineBody:
      '読み込み済みの画面とデータを表示しています。一部の動画や外部リンクは利用できません。',
    offlineReadyTitle: 'オフライン利用の準備ができました',
    offlineReadyBody:
      '次回以降、通信がない状態でも読み込み済みのアプリを再表示できます。',
    installedTitle: 'インストールしました',
    installedBody:
      'SVNS Stats Analyzerをホーム画面から起動できます。',
    close: '閉じる',
  },
  en: {
    updateTitle: 'An update is available',
    updateBody:
      'A newer version is ready. Updating will reload the page.',
    updateButton: 'Update',
    installTitle: 'Install this app',
    installBody:
      'Add the app to your home screen and launch it without opening the browser first.',
    installButton: 'Install',
    offlineTitle: 'You are offline',
    offlineBody:
      'Previously loaded screens and data remain available. Video and external links may not work.',
    offlineReadyTitle: 'Offline access is ready',
    offlineReadyBody:
      'Previously loaded app content can be reopened when a network connection is unavailable.',
    installedTitle: 'App installed',
    installedBody:
      'SVNS Stats Analyzer can now be launched from your home screen.',
    close: 'Close',
  },
};

function resolveLabels(labels, language) {
  return {
    ...(FALLBACK_LABELS[language] || FALLBACK_LABELS.en),
    ...(labels || {}),
  };
}

export default function PwaStatus({ language = 'ja', labels }) {
  const resolvedLabels = useMemo(
    () => resolveLabels(labels, language),
    [labels, language]
  );
  const [runtimeState, setRuntimeState] = useState(
    getPwaRuntimeState()
  );
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handlePwaState = (event) => {
      setRuntimeState(event.detail || getPwaRuntimeState());
      setDismissed(false);
    };
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('svns:pwa-state', handlePwaState);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setRuntimeState(getPwaRuntimeState());

    return () => {
      window.removeEventListener('svns:pwa-state', handlePwaState);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  let notice = null;

  if (runtimeState.updateReady) {
    notice = {
      kind: 'update',
      icon: RefreshCw,
      title: resolvedLabels.updateTitle,
      body: resolvedLabels.updateBody,
      actionLabel: resolvedLabels.updateButton,
      onAction: applyServiceWorkerUpdate,
      dismissible: false,
    };
  } else if (!online) {
    notice = {
      kind: 'offline',
      icon: WifiOff,
      title: resolvedLabels.offlineTitle,
      body: resolvedLabels.offlineBody,
      dismissible: false,
    };
  } else if (runtimeState.installAvailable) {
    notice = {
      kind: 'install',
      icon: Download,
      title: resolvedLabels.installTitle,
      body: resolvedLabels.installBody,
      actionLabel: resolvedLabels.installButton,
      onAction: requestPwaInstall,
      dismissible: true,
    };
  } else if (runtimeState.justInstalled) {
    notice = {
      kind: 'success',
      icon: CheckCircle2,
      title: resolvedLabels.installedTitle,
      body: resolvedLabels.installedBody,
      dismissible: true,
    };
  } else if (runtimeState.offlineReady) {
    notice = {
      kind: 'success',
      icon: CheckCircle2,
      title: resolvedLabels.offlineReadyTitle,
      body: resolvedLabels.offlineReadyBody,
      dismissible: true,
    };
  }

  if (!notice || dismissed) {
    return null;
  }

  const Icon = notice.icon;

  return (
    <aside
      className={`pwaStatus pwaStatus--${notice.kind}`}
      aria-live="polite"
      aria-label={notice.title}
    >
      <Icon size={20} aria-hidden="true" />

      <div className="pwaStatusText">
        <strong>{notice.title}</strong>
        <p>{notice.body}</p>
      </div>

      {notice.actionLabel && (
        <button
          type="button"
          className="pwaStatusAction"
          onClick={notice.onAction}
        >
          {notice.actionLabel}
        </button>
      )}

      {notice.dismissible && (
        <button
          type="button"
          className="pwaStatusClose"
          onClick={() => setDismissed(true)}
          aria-label={resolvedLabels.close}
          title={resolvedLabels.close}
        >
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}
