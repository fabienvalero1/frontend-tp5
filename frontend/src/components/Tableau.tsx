import React, { JSX, useEffect, useMemo, useReducer, useState } from 'react';

type Column = { key: string; label: string };
type Row = Record<string, any> & { id?: number | string };

type SortState = { key?: string; direction?: 'asc' | 'desc' };
type UIState = {
    sort: SortState;
    filter: string;
    page: number;
    pageSize: number;
    columnsOrder?: string[];
};

type Action =
    | { type: 'SET_SORT'; payload: SortState }
    | { type: 'SET_FILTER'; payload: string }
    | { type: 'SET_PAGE'; payload: number }
    | { type: 'SET_PAGE_SIZE'; payload: number }
    | { type: 'SET_COLUMNS_ORDER'; payload: string[] }
    | { type: 'RESET'; payload?: UIState };

const STORAGE_KEY = 'tableau_ui_state_v1';

const defaultUIState = (): UIState => ({
    sort: {},
    filter: '',
    page: 1,
    pageSize: 10,
    columnsOrder: undefined,
});

function uiReducer(state: UIState, action: Action): UIState {
    switch (action.type) {
        case 'SET_SORT':
            return { ...state, sort: action.payload, page: 1 };
        case 'SET_FILTER':
            return { ...state, filter: action.payload, page: 1 };
        case 'SET_PAGE':
            return { ...state, page: Math.max(1, action.payload) };
        case 'SET_PAGE_SIZE':
            return { ...state, pageSize: action.payload, page: 1 };
        case 'SET_COLUMNS_ORDER':
            return { ...state, columnsOrder: action.payload };
        case 'RESET':
            return action.payload ?? defaultUIState();
        default:
            return state;
    }
}

function isStorageAvailable(type: 'localStorage' | 'sessionStorage') {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export default function Tableau() {
    const columns: Column[] = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Rôle' },
    ];

    /* ---------------------------- UI STATE ---------------------------- */

    const [ui, dispatch] = useReducer(uiReducer, undefined, () => {
        try {
            if (isStorageAvailable('sessionStorage')) {
                const raw = sessionStorage.getItem(STORAGE_KEY);
                if (raw) return { ...defaultUIState(), ...JSON.parse(raw) };
            }
        } catch {}
        return defaultUIState();
    });

    useEffect(() => {
        try {
            if (isStorageAvailable('sessionStorage')) {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ui));
            }
        } catch {}
    }, [ui]);

    /* ---------------------------- DATA FETCH ---------------------------- */

    const [rows, setRows] = useState<Row[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const limit = ui.pageSize;
        const offset = (ui.page - 1) * ui.pageSize;

        setLoading(true);

        fetch(`http://localhost:4000/api/users?limit=${limit}&offset=${offset}`)
            .then(res => res.json())
            .then(json => {
                setRows(json.data);
                setTotal(json.total);
            })
            .catch(() => alert("Erreur lors du chargement des utilisateurs"))
            .finally(() => setLoading(false));
    }, [ui.page, ui.pageSize]);

    /* ---------------------------- PROCESSING ---------------------------- */

    const processed = useMemo(() => {
        let ds = rows.slice();

        // filtrage client
        if (ui.filter) {
            const q = ui.filter.toLowerCase();
            ds = ds.filter((r) =>
                columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q))
            );
        }

        // tri client
        if (ui.sort.key) {
            const { key, direction } = ui.sort;
            const dir = direction === 'asc' ? 1 : -1;
            ds.sort((a, b) => String(a[key!]).localeCompare(String(b[key!])) * dir);
        }

        // réordering
        let orderedCols = columns;
        if (ui.columnsOrder) {
            const map = new Map(columns.map(c => [c.key, c]));
            orderedCols = ui.columnsOrder.map(k => map.get(k)).filter(Boolean) as Column[];
        }

        return { data: ds, columns: orderedCols, total };
    }, [rows, columns, ui]);

    /* ---------------------------- RENDER ---------------------------- */

    const moveColumn = (key: string, direction: "left" | "right") => {
        const order = ui.columnsOrder ?? columns.map(c => c.key);
        const idx = order.indexOf(key);
        const target = direction === "left" ? idx - 1 : idx + 1;
        if (target < 0 || target >= order.length) return;
        const next = [...order];
        [next[idx], next[target]] = [next[target], next[idx]];
        dispatch({ type: "SET_COLUMNS_ORDER", payload: next });
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div>
            <div style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
                <input
                    placeholder="Filtrer..."
                    value={ui.filter}
                    onChange={(e) => dispatch({ type: 'SET_FILTER', payload: e.target.value })}
                    style={{ padding: '6px', flex: '1' }}
                />
                <button onClick={() => dispatch({ type: 'RESET' })}>
                    Réinitialiser affichage
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr>
                    {processed.columns.map(col => (
                        <th key={col.key}>{col.label}</th>
                    ))}
                </tr>
                </thead>

                <tbody>
                {processed.data.map(row => (
                    <tr key={row.id}>
                        {processed.columns.map(col => (
                            <td key={col.key}>{row[col.key]}</td>
                        ))}
                    </tr>
                ))}
                </tbody>

                <tfoot>
                <tr>
                    <td colSpan={processed.columns.length}>
                        Total : {processed.total} utilisateurs
                    </td>
                </tr>
                </tfoot>
            </table>

            {/* Réorganisation des colonnes */}
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                {processed.columns.map((c, i) => (
                    <div key={c.key} style={{ display: 'flex', gap: '4px' }}>
                        {c.label}
                        <button onClick={() => moveColumn(c.key, 'left')} disabled={i === 0}>◀</button>
                        <button onClick={() => moveColumn(c.key, 'right')} disabled={i === processed.columns.length - 1}>▶</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
