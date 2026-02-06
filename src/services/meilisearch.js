import { MeiliSearch } from 'meilisearch';

const host = import.meta.env.VITE_MEILISEARCH_HOST || 'http://localhost:7700';
const apiKey = import.meta.env.VITE_MEILISEARCH_API_KEY || '';

export const meiliClient = new MeiliSearch({
    host: host,
    apiKey: apiKey,
});

export const VICTIMS_INDEX = import.meta.env.VITE_MEILISEARCH_INDEX || 'victims';
