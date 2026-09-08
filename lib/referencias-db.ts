// IndexedDB wrapper para referências visuais (moodboard)
// Usamos IndexedDB em vez de localStorage por causa do tamanho das imagens.

export type Referencia = {
  id: string;
  titulo: string;
  tags: string[];
  projetoId?: string;
  nota: string;
  link: string;
  imagens: Array<{ id: string; dataUrl: string; nome: string }>;
  criadoEm: string;
};

const DB_NAME = "archia_referencias";
const STORE = "referencias";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("projetoId", "projetoId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(
  db: IDBDatabase,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE);
}

export async function getAllReferencias(): Promise<Referencia[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readonly").getAll();
    req.onsuccess = () => resolve((req.result as Referencia[]).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)));
    req.onerror = () => reject(req.error);
  });
}

export async function getReferencia(id: string): Promise<Referencia | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readonly").get(id);
    req.onsuccess = () => resolve(req.result as Referencia | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function saveReferencia(ref: Referencia): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").put(ref);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteReferencia(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function emptyReferencia(): Referencia {
  return {
    id: crypto.randomUUID(),
    titulo: "",
    tags: [],
    projetoId: undefined,
    nota: "",
    link: "",
    imagens: [],
    criadoEm: new Date().toISOString(),
  };
}

// Converte File → dataUrl
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
