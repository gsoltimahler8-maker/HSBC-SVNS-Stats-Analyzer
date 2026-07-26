const PWA_EVENT_NAME = 'svns:pwa-state';

const runtimeState = {
  registration: null,
  updateReady: false,
  offlineReady: false,
  installAvailable: false,
  justInstalled: false,
  installPrompt: null,
};

let reloadAfterControllerChange = false;

function emitState(patch = {}) {
  Object.assign(runtimeState, patch);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(PWA_EVENT_NAME, {
        detail: getPwaRuntimeState(),
      })
    );
  }
}

export function getPwaRuntimeState() {
  return {
    registration: runtimeState.registration,
    updateReady: runtimeState.updateReady,
    offlineReady: runtimeState.offlineReady,
    installAvailable: runtimeState.installAvailable,
    justInstalled: runtimeState.justInstalled,
  };
}

export function applyServiceWorkerUpdate() {
  const waitingWorker = runtimeState.registration?.waiting;

  if (!waitingWorker) {
    runtimeState.registration?.update();
    return false;
  }

  reloadAfterControllerChange = true;
  waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  return true;
}

export async function requestPwaInstall() {
  const promptEvent = runtimeState.installPrompt;

  if (!promptEvent) {
    return false;
  }

  await promptEvent.prompt();
  const choice = await promptEvent.userChoice;

  emitState({
    installPrompt: null,
    installAvailable: false,
  });

  return choice?.outcome === 'accepted';
}

function watchRegistration(registration) {
  emitState({ registration });

  if (registration.waiting && navigator.serviceWorker.controller) {
    emitState({ updateReady: true });
  }

  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;

    if (!installingWorker) {
      return;
    }

    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state !== 'installed') {
        return;
      }

      if (navigator.serviceWorker.controller) {
        emitState({
          registration,
          updateReady: true,
        });
      } else {
        emitState({
          registration,
          offlineReady: true,
        });
      }
    });
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();

    emitState({
      installPrompt: event,
      installAvailable: true,
    });
  });

  window.addEventListener('appinstalled', () => {
    emitState({
      installPrompt: null,
      installAvailable: false,
      justInstalled: true,
    });
  });
}

if (
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  import.meta.env.PROD
) {
  const serviceWorkerUrl =
    `${import.meta.env.BASE_URL}service-worker.js`;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        serviceWorkerUrl,
        {
          scope: import.meta.env.BASE_URL,
          updateViaCache: 'none',
        }
      );

      watchRegistration(registration);

      window.addEventListener('focus', () => {
        registration.update().catch(() => {});
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloadAfterControllerChange) {
      return;
    }

    reloadAfterControllerChange = false;
    window.location.reload();
  });
}
