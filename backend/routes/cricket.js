const express = require('express');
const router = express.Router();
const axios = require('axios');

// Mock data for when API key is not configured
const MOCK_LIVE_MATCHES = [
  {
    id: 'mock-1',
    name: 'India vs Australia - 1st Test',
    matchType: 'Test',
    status: 'live',
    venue: 'Narendra Modi Stadium, Ahmedabad',
    date: new Date().toISOString(),
    dateTimeGMT: new Date().toISOString(),
    teams: ['India', 'Australia'],
    teamInfo: [
      { name: 'India', shortname: 'IND', img: 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg' },
      { name: 'Australia', shortname: 'AUS', img: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg' },
    ],
    score: [
      { r: 245, w: 6, o: 65.2, inning: 'India Inning 1' },
      { r: 180, w: 10, o: 52.0, inning: 'Australia Inning 1' },
    ],
  },
  {
    id: 'mock-2',
    name: 'Chennai Super Kings vs Mumbai Indians - IPL 2026',
    matchType: 'T20',
    status: 'live',
    venue: 'MA Chidambaram Stadium, Chennai',
    date: new Date().toISOString(),
    teams: ['Chennai Super Kings', 'Mumbai Indians'],
    teamInfo: [
      { name: 'Chennai Super Kings', shortname: 'CSK', img: '' },
      { name: 'Mumbai Indians', shortname: 'MI', img: '' },
    ],
    score: [
      { r: 167, w: 4, o: 18.3, inning: 'CSK Inning 1' },
    ],
  },
];

const MOCK_UPCOMING_MATCHES = [
  {
    id: 'up-1',
    name: 'India vs England - 2nd ODI',
    matchType: 'ODI',
    status: 'upcoming',
    venue: 'Eden Gardens, Kolkata',
    date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    dateTimeGMT: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    teams: ['India', 'England'],
    teamInfo: [
      { name: 'India', shortname: 'IND', img: '' },
      { name: 'England', shortname: 'ENG', img: '' },
    ],
  },
  {
    id: 'up-2',
    name: 'Royal Challengers vs Delhi Capitals - IPL 2026',
    matchType: 'T20',
    status: 'upcoming',
    venue: 'M. Chinnaswamy Stadium, Bengaluru',
    date: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
    dateTimeGMT: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
    teams: ['Royal Challengers Bengaluru', 'Delhi Capitals'],
    teamInfo: [
      { name: 'Royal Challengers Bengaluru', shortname: 'RCB', img: '' },
      { name: 'Delhi Capitals', shortname: 'DC', img: '' },
    ],
  },
  {
    id: 'up-3',
    name: 'Pakistan vs Sri Lanka - T20I',
    matchType: 'T20I',
    status: 'upcoming',
    venue: 'Gaddafi Stadium, Lahore',
    date: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    dateTimeGMT: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    teams: ['Pakistan', 'Sri Lanka'],
    teamInfo: [
      { name: 'Pakistan', shortname: 'PAK', img: '' },
      { name: 'Sri Lanka', shortname: 'SL', img: '' },
    ],
  },
];

// Helper to map score array elements to correct teams
function mapScoresToTeams(teams, score) {
  if (!score || score.length === 0) return [null, null];
  if (score.length === 1) {
    const s = score[0];
    const inn = (s.inning || "").toLowerCase();
    const t1 = teams[0].toLowerCase();
    const t2 = teams[1].toLowerCase();
    if (inn.includes(t1) && !inn.includes(t2)) return [s, null];
    if (inn.includes(t2) && !inn.includes(t1)) return [null, s];
    if (inn.includes(t1)) return [s, null];
    return [null, s];
  }
  
  const s0 = score[0];
  const s1 = score[1];
  const inn0 = (s0.inning || "").toLowerCase();
  const inn1 = (s1.inning || "").toLowerCase();
  const t1 = teams[0].toLowerCase();
  const t2 = teams[1].toLowerCase();

  const s0MatchesT1 = inn0.includes(t1);
  const s0MatchesT2 = inn0.includes(t2);
  const s1MatchesT1 = inn1.includes(t1);
  const s1MatchesT2 = inn1.includes(t2);

  if (s0MatchesT1 && !s0MatchesT2) {
    return [s0, s1];
  }
  if (s1MatchesT1 && !s1MatchesT2) {
    return [s1, s0];
  }
  if (s0MatchesT2 && !s0MatchesT1) {
    return [s1, s0];
  }
  if (s1MatchesT2 && !s1MatchesT1) {
    return [s0, s1];
  }

  if (inn0.startsWith(t1)) return [s0, s1];
  if (inn1.startsWith(t1)) return [s1, s0];
  if (inn0.startsWith(t2)) return [s1, s0];
  if (inn1.startsWith(t2)) return [s0, s1];

  return [s0, s1];
}

// Helper to normalize match teamInfo and scores according to teams array
const normalizeMatch = (match) => {
  const teams = match.teams || [];
  if (teams.length < 2) return match;

  const team1Name = teams[0];
  const team2Name = teams[1];

  const teamInfo = match.teamInfo || [];
  const team1Obj = teamInfo.find(t => t.name.toLowerCase() === team1Name.toLowerCase()) || { name: team1Name };
  const team2Obj = teamInfo.find(t => t.name.toLowerCase() === team2Name.toLowerCase()) || { name: team2Name };

  const scores = mapScoresToTeams(teams, match.score);

  return {
    ...match,
    teamInfo: [team1Obj, team2Obj],
    score: scores.filter(s => s !== null),
  };
};


// Helper to parse Cricbuzz matches list into frontend format
function parseMatchesGeneric(data) {
  const allMatches = [];
  if (!data) return [];

  // 1. Check if it's Free Cricbuzz Cricket API (Creativesdev) format
  if (data.status === 'success' && data.response) {
    const resp = data.response;
    
    // Case A: livescores (array of matches)
    if (Array.isArray(resp)) {
      resp.forEach(m => {
        const parsedMatch = parseSingleCricbuzzMatch(m);
        if (parsedMatch) allMatches.push(parsedMatch);
      });
    } 
    // Case B: schedule (object with schedules array)
    else if (resp.schedules && Array.isArray(resp.schedules)) {
      resp.schedules.forEach(scheduleObj => {
        const wrapper = scheduleObj.scheduleAdWrapper || {};
        const matchScheduleList = wrapper.matchScheduleList || [];
        
        matchScheduleList.forEach(seriesObj => {
          const seriesName = seriesObj.seriesName || "";
          const matchesList = seriesObj.matchInfo || [];
          
          matchesList.forEach(matchInfo => {
            const parsedMatch = parseSingleCricbuzzMatch({ matchInfo });
            if (parsedMatch) {
              if (seriesName && !parsedMatch.name.includes(seriesName)) {
                parsedMatch.seriesName = seriesName;
              }
              allMatches.push(parsedMatch);
            }
          });
        });
      });
    }
  }
  // 2. Check if it's Cricbuzz Cricket API (APIDojo) format
  else if (data.typeMatches && Array.isArray(data.typeMatches)) {
    data.typeMatches.forEach(typeObj => {
      const matchType = typeObj.matchType || "";
      const seriesMatches = typeObj.seriesMatches || [];
      
      seriesMatches.forEach(seriesObj => {
        const wrapper = seriesObj.seriesAdWrapper || seriesObj;
        const matchesList = wrapper.matches || [];
        
        matchesList.forEach(m => {
          const parsedMatch = parseSingleCricbuzzMatch(m);
          if (parsedMatch) {
            if (matchType && !parsedMatch.matchType) {
              parsedMatch.matchType = matchType;
            }
            allMatches.push(parsedMatch);
          }
        });
      });
    });
  }

  return allMatches;
}

// Helper to parse a single match object from either Cricbuzz provider
function parseSingleCricbuzzMatch(m) {
  const matchInfo = m.matchInfo || {};
  const matchScore = m.matchScore || {};
  
  const team1 = matchInfo.team1 || {};
  const team2 = matchInfo.team2 || {};
  
  if (!team1.teamName && !team2.teamName) return null;

  const team1Score = matchScore.team1Score || null;
  const team2Score = matchScore.team2Score || null;
  
  let score1 = null;
  if (team1Score && (team1Score.inngs1 || team1Score.inngs2)) {
    const inn = team1Score.inngs2 || team1Score.inngs1;
    score1 = {
      r: inn.runs,
      w: inn.wickets || 0,
      o: inn.overs,
      inning: `${team1.teamName} ${team1Score.inngs2 ? 'Inning 2' : 'Inning 1'}`
    };
  }

  let score2 = null;
  if (team2Score && (team2Score.inngs1 || team2Score.inngs2)) {
    const inn = team2Score.inngs2 || team2Score.inngs1;
    score2 = {
      r: inn.runs,
      w: inn.wickets || 0,
      o: inn.overs,
      inning: `${team2.teamName} ${team2Score.inngs2 ? 'Inning 2' : 'Inning 1'}`
    };
  }

  const isFinished = matchInfo.state?.toLowerCase() === 'complete';
  const isLive = matchInfo.state?.toLowerCase() === 'live';

  // Parse date safely
  let formattedDate = new Date().toISOString();
  if (matchInfo.startDate) {
    const parsed = typeof matchInfo.startDate === 'string' ? parseInt(matchInfo.startDate, 10) : matchInfo.startDate;
    if (!isNaN(parsed)) {
      formattedDate = new Date(parsed).toISOString();
    }
  }

  return {
    id: matchInfo.matchId?.toString() || Math.random().toString(),
    name: `${team1.teamName || 'Team A'} vs ${team2.teamName || 'Team B'}${matchInfo.matchDesc ? ` - ${matchInfo.matchDesc}` : ''}`,
    matchType: matchInfo.matchFormat || "",
    status: matchInfo.status || (isLive ? "Live" : (isFinished ? "Match completed" : "Upcoming")),
    venue: matchInfo.venueInfo ? `${matchInfo.venueInfo.ground || 'TBA'}, ${matchInfo.venueInfo.city || 'TBA'}` : "TBA",
    date: formattedDate,
    dateTimeGMT: formattedDate,
    teams: [team1.teamName || 'Team A', team2.teamName || 'Team B'],
    teamInfo: [
      { name: team1.teamName || 'Team A', shortname: team1.teamSName || 'T1', img: '' },
      { name: team2.teamName || 'Team B', shortname: team2.teamSName || 'T2', img: '' }
    ],
    score: [score1, score2],
    matchEnded: isFinished,
    matchStarted: isLive || isFinished
  };
}

// GET /api/cricket/live
router.get('/live', async (req, res) => {
  const provider = process.env.CRICKET_API_PROVIDER || 'cricapi';

  if (provider === 'rapidapi') {
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    const rapidApiHost = process.env.RAPIDAPI_HOST;

    if (!rapidApiKey || rapidApiKey === 'your_rapidapi_key') {
      return res.status(400).json({ success: false, message: 'RapidAPI key is not configured.' });
    }

    let path = '/matches/v1/live';
    if (rapidApiHost.includes('free-cricbuzz')) {
      path = '/cricket-livescores';
    }

    try {
      const response = await axios.get(`https://${rapidApiHost}${path}`, {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': rapidApiHost
        },
        timeout: 15000,
      });

      const parsed = parseMatchesGeneric(response.data);
      res.json({ success: true, data: parsed, source: 'api' });
    } catch (err) {
      console.error('RapidAPI Cricket error:', err.message);
      res.status(err.response?.status || 502).json({
        success: false,
        message: 'Failed to fetch live scores from RapidAPI: ' + (err.response?.data?.message || err.message)
      });
    }
  } else {
    const apiKey = process.env.CRICKET_API_KEY;
    const baseUrl = process.env.CRICKET_API_BASE;

    if (!apiKey || apiKey === 'your_cricket_api_key') {
      return res.status(400).json({ success: false, message: 'Cricket API key is not configured.' });
    }

    try {
      const response = await axios.get(`${baseUrl}/currentMatches`, {
        params: { apikey: apiKey, offset: 0 },
        timeout: 15000,
      });
      if (response.data.status === 'failure' || !response.data.data) {
        return res.status(429).json({ success: false, message: response.data.reason || 'Cricket API limit reached' });
      }
      const normalized = (response.data.data || []).map(normalizeMatch);
      res.json({ success: true, data: normalized, source: 'api' });
    } catch (err) {
      console.error('Cricket API error:', err.message);
      res.status(502).json({ success: false, message: 'Failed to fetch live scores: ' + err.message });
    }
  }
});

// GET /api/cricket/upcoming
router.get('/upcoming', async (req, res) => {
  const provider = process.env.CRICKET_API_PROVIDER || 'cricapi';

  if (provider === 'rapidapi') {
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    const rapidApiHost = process.env.RAPIDAPI_HOST;

    if (!rapidApiKey || rapidApiKey === 'your_rapidapi_key') {
      return res.status(400).json({ success: false, message: 'RapidAPI key is not configured.' });
    }

    let path = '/matches/v1/upcoming';
    if (rapidApiHost.includes('free-cricbuzz')) {
      path = '/cricket-schedule';
    }

    try {
      const response = await axios.get(`https://${rapidApiHost}${path}`, {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': rapidApiHost
        },
        timeout: 15000,
      });

      const parsed = parseMatchesGeneric(response.data);
      const upcoming = parsed.filter(m => m.matchStarted === false);
      res.json({ success: true, data: upcoming, source: 'api' });
    } catch (err) {
      console.error('RapidAPI Cricket error:', err.message);
      res.status(err.response?.status || 502).json({
        success: false,
        message: 'Failed to fetch upcoming matches from RapidAPI: ' + (err.response?.data?.message || err.message)
      });
    }
  } else {
    const apiKey = process.env.CRICKET_API_KEY;
    const baseUrl = process.env.CRICKET_API_BASE;

    if (!apiKey || apiKey === 'your_cricket_api_key') {
      return res.status(400).json({ success: false, message: 'Cricket API key is not configured.' });
    }

    try {
      const response = await axios.get(`${baseUrl}/matches`, {
        params: { apikey: apiKey, offset: 0 },
        timeout: 15000,
      });
      if (response.data.status === 'failure' || !response.data.data) {
        return res.status(429).json({ success: false, message: response.data.reason || 'Cricket API limit reached' });
      }
      const upcoming = (response.data.data || []).filter((m) => m.matchStarted === false);
      const normalized = upcoming.map(normalizeMatch);
      res.json({ success: true, data: normalized, source: 'api' });
    } catch (err) {
      console.error('Cricket API error:', err.message);
      res.status(502).json({ success: false, message: 'Failed to fetch upcoming matches: ' + err.message });
    }
  }
});

module.exports = router;

