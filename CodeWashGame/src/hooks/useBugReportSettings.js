import { useCallback, useState } from 'react';
import { browserStorage } from '../services/storage';

const ENDPOINT_KEY = 'bugReportEndpoint_v1';

/** Persisted bug-report endpoint (configured in Settings). */
export function useBugReportSettings() {
    const [endpoint, setEndpointState] = useState(() => browserStorage.getItem(ENDPOINT_KEY) || '');

    const setEndpoint = useCallback((value) => {
        setEndpointState(value);
        browserStorage.setItem(ENDPOINT_KEY, value);
    }, []);

    return { endpoint, setEndpoint };
}

export default useBugReportSettings;
