import axios from 'axios';
import puppeteer from 'puppeteer';

export interface YouTubeMetadata {
  title: string;
  description: string;
  thumbnailUrl: string;
}

export interface TwitterMetadata {
  text: string;
  author: string;
  mediaUrls: string[];
}

interface ContentMetadata {
  title: string;
  content: string;
  thumbnail: string | null;
}



export const handleNote = async (title: string, content: string): Promise<ContentMetadata> => {
  return {
    title: title || 'Untitled Note',
    content: content || '',
    thumbnail: null
  };
};

export const fetchYouTube = async (url: string): Promise<ContentMetadata> => {
  try {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    if (!videoId) throw new Error('Invalid YouTube URL');

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`
    );

    const video = response.data.items[0]?.snippet;
    if (!video) throw new Error('YouTube metadata not found');

    return {
      title: video.title,
      content: `${video.description}\n\n${url}`,
      thumbnail: video.thumbnails.high?.url || null
    };
  } catch (error) {
    console.error('YouTube fetching error:', error);
    throw error;
  }
};

export const fetchTwitter = async (url: string): Promise<ContentMetadata> => {
  const browser = await puppeteer.launch({
    headless: true,  // Using boolean true for compatibility
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--ignore-certificate-errors'
    ],
    timeout: 60000
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('body');

    const metadata = await page.evaluate(() => {
      const tweetText = document.querySelector('article div[data-testid="tweetText"]')?.textContent?.trim() || 'No tweet content';
      const author = document.querySelector('article a[role="link"] span')?.textContent?.trim() || 'Unknown';
     
      
      return { author, tweetText };
    });

    return {
      title: `Tweet by ${metadata.author}`,
      content: `${metadata.tweetText}\n\n${url}`,
      thumbnail: null,
    };
  } catch (error) {
    console.error('Twitter fetching error:', error);
    throw error;
  } finally {
    await browser.close();
  }
};

export const fetchWebsite = async (url: string): Promise<ContentMetadata> => {

  const browser = await puppeteer.launch({
    headless: true,  
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--ignore-certificate-errors'
    ],
    timeout: 60000
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000  });
    await page.waitForSelector('body');

    return await page.evaluate(() => {
      const title = document.title || 'Untitled';
      const content = document.body.innerText?.trim() || '';
      
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
      const firstImage = document.querySelector('img')?.getAttribute('src');
      
      const thumbnail = ogImage || firstImage || null;
      const absoluteUrl = thumbnail && !thumbnail.startsWith('http') 
        ? new URL(thumbnail, window.location.origin).href 
        : thumbnail;

      return { title, content, thumbnail: absoluteUrl };
    });
  } catch (error) {
    console.error('Website fetching error:', error);
    throw error;
  } finally {
    await browser.close();
  }
};

export async function getYoutubeMetadata(videoUrl: string): Promise<YouTubeMetadata> {
  const videoId = extractYoutubeVideoId(videoUrl);
  const API_KEY = process.env.YOUTUBE_API_KEY;
  
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
    );

    const video = response.data.items[0].snippet;
    return {
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnails.maxres?.url || video.thumbnails.high.url || video.thumbnails.default.url
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw error;
  }
}

export async function getTwitterMetadata(tweetUrl: string): Promise<TwitterMetadata> {
  try {
    const tweetId = extractTweetId(tweetUrl);
    const bearerToken = process.env.TWITTER_BEARER_TOKEN?.trim();
    
    // Better debug logging
    console.log('Tweet ID:', tweetId);
    console.log('Token Status:', bearerToken ? 'Present' : 'Missing');

    if (!bearerToken) {
      throw new Error('Twitter Bearer Token is not configured');
    }

    const response = await axios.get(
      `https://api.twitter.com/2/tweets/${tweetId}`,
      {
        headers: { 
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          'expansions': 'attachments.media_keys',
          'media.fields': 'url,preview_image_url,type'
        }
      }
    );

    // Add response logging
    console.log('Twitter API Response:', {
      status: response.status,
      hasData: !!response.data,
      hasMedia: !!response.data.includes?.media
    });

    const mediaUrls = response.data.includes?.media?.map((media: any) => {
      return media.type === 'video' ? media.preview_image_url : media.url;
    }) || [];

    return {
      text: response.data.data.text,
      author: response.data.data.author_id,
      mediaUrls
    };
  } catch (error) {
    console.error('Twitter API Error:', error);
    throw error;
  }
}

function extractYoutubeVideoId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}

function extractTweetId(url: string): string {
  const matches = url.match(/twitter\.com\/\w+\/status\/(\d+)/);
  return matches ? matches[1] : '';
}