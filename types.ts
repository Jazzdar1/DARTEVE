export type View = 'live-events' | 'categories' | 'channel-detail' | 'player';

export interface Match {
  id: string;
  sport: string;
  league: string;
  team1: string;
  team2: string;
  team1Logo: string;
  team2Logo: string;
  status: 'Live' | 'Scheduled' | 'Finished';
  time: string;
  isHot?: boolean;
  streamUrl: string;
  groupTitle?: string;
}

export interface Category {
  id: string;
  name: string;
  playlistUrl: string;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  categoryId: string;
  streamUrl: string;
}