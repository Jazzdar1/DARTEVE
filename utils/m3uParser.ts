import { Match, Channel } from '../types';

export const fetchAndParsePlaylist = async (url: string, signal?: AbortSignal) => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Failed to fetch playlist');
  
  const text = await response.text();
  const lines = text.split('\n');
  
  const parsedMatches: Match[] = [];
  const parsedChannels: Channel[] = [];
  let currentInfo: any = null;

  const sportsKeywords = ['sport', 'cricket', 'football', 'soccer', 'tennis', 'willow', 'star', 'ten', 'espn', 'bein', 'sky'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const name = line.split(',').pop() || 'Unknown Channel';
      
      currentInfo = {
        name,
        logo: logoMatch ? logoMatch[1] : 'https://picsum.photos/200',
        group: groupMatch ? groupMatch[1] : 'General'
      };
    } else if (line.startsWith('http') && currentInfo) {
      const nameLower = currentInfo.name.toLowerCase();
      const groupLower = currentInfo.group.toLowerCase();
      
      const isSports = sportsKeywords.some(keyword => 
        nameLower.includes(keyword) || groupLower.includes(keyword)
      );

      const channel: Channel = {
        id: `ch-${parsedChannels.length}`,
        name: currentInfo.name,
        logo: currentInfo.logo,
        categoryId: isSports ? 'cat5' : 'cat1',
        streamUrl: line
      };
      parsedChannels.push(channel);

      if (isSports) {
        const isCricket = nameLower.includes('cricket') || nameLower.includes('willow') || nameLower.includes('star');
        parsedMatches.push({
          id: `m-${parsedMatches.length}`,
          sport: isCricket ? 'Cricket' : 'Football',
          league: currentInfo.group,
          team1: currentInfo.name,
          team2: 'Live Broadcast',
          team1Logo: currentInfo.logo,
          team2Logo: currentInfo.logo,
          status: 'Live',
          time: 'Live Now',
          isHot: true,
          streamUrl: line,
          groupTitle: currentInfo.group
        });
      }
      currentInfo = null;
    }
  }
  return { parsedMatches, parsedChannels };
};