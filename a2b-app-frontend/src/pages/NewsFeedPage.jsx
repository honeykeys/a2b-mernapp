// src/pages/NewsFeedPage.jsx
import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import NewspaperIcon from '@mui/icons-material/Newspaper'; // Icon for the page title

import { getNewsFeed } from '../services/apiService'; // Adjust path as needed

function NewsFeedPage() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getNewsFeed();
        setNewsItems(data || []); // Ensure newsItems is always an array
      } catch (err) {
        setError(err.message || 'Failed to fetch news feed.');
        console.error("News Feed Page Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []); // Empty dependency array, so it runs once on mount

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading news...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <NewspaperIcon sx={{ mr: 1, fontSize: 'inherit' }} />
          Football News Feed
        </Typography>
        <Typography variant="body1">
          Could not load news items at this time. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto' }}> {/* Centered content with max-width */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <NewspaperIcon sx={{ mr: 1, fontSize: '2.5rem' }} />
        Latest Football News
      </Typography>

      {newsItems.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No news items available at the moment.</Typography>
        </Paper>
      ) : (
        <List disablePadding>
          {newsItems.map((item, index) => (
            <Paper 
              elevation={2} 
              sx={{ 
                mb: 2.5, 
                p: 2.5, 
                borderRadius: 2, 
                '&:hover': { boxShadow: 6 } 
              }} 
              key={item.link || index}
            >
              <ListItem alignItems="flex-start" disableGutters sx={{display: 'block'}}> {/* display block for full width usage */}
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ fontWeight: 'bold', mb: 0.5 }}
                >
                  <Link 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    underline="hover" 
                    color="text.primary"
                    sx={{ '&:hover': { color: 'primary.main' } }}
                  >
                    {item.title || 'Untitled Article'}
                  </Link>
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ display: 'block', mb: 1 }}
                >
                  Source: {item.source_name || 'Unknown Source'} | Published: {item.publication_date ? new Date(item.publication_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date N/A'}
                </Typography>
                {item.snippet && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      // Simple text truncation for snippet
                      // maxHeight: '4.5em', // Approx 3 lines
                      // overflow: 'hidden',
                      // textOverflow: 'ellipsis',
                      // display: '-webkit-box',
                      // WebkitLineClamp: 3, 
                      // WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.snippet}
                  </Typography>
                )}
              </ListItem>
              {/* Optional: Add a divider if you prefer it over Paper separation */}
              {/* {index < newsItems.length - 1 && <Divider sx={{ my: 2 }} />} */}
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
}

export default NewsFeedPage;
