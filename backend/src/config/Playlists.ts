export interface PlaylistsConfig {
    playlists: Playlist[];
}

interface Playlist {
    id: string;
    presets: string[];
}
