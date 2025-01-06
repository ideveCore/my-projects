import { FS_TYPE } from '$lib/buckets/fs_type';
import { derived, fromStore, get, readable, readonly, toStore, writable } from 'svelte/store';

export const fs_types = writable(await new FS_TYPE().build());
