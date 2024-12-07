'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Alert,
} from '@mui/material';

export default function SocialForm() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   // Fetch user data from Warpcast API
  //   const fetchUserData = async () => {
  //     try {
  //       const response = await fetch('/api/warpcast/user');
  //       if (!response.ok) throw new Error('Failed to fetch user data');
  //       const data = await response.json();
  //       setUserData(data);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserData();
  // }, []);

  const handleSubmit = () => {
    // Redirect to DEX page
    router.push('/dex');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        <Typography variant="h6" className="text-white">
          Loading your profile data...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        <Alert severity="error" className="max-w-md">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-8">
      <Paper elevation={3} className="max-w-2xl w-full p-8">
        <Typography variant="h4" component="h1" gutterBottom className="text-center">
          Verify Your Profile
        </Typography>

        <Box className="mt-6">
          <Typography variant="h6" gutterBottom>
            Please verify that this information is correct:
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary="Username"
                secondary={userData?.username || 'Not available'}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Display Name"
                secondary={userData?.displayName || 'Not available'}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Bio"
                secondary={userData?.bio || 'Not available'}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Followers"
                secondary={userData?.followerCount || '0'}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Following"
                secondary={userData?.followingCount || '0'}
              />
            </ListItem>
          </List>

          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmit}
              className="w-48"
            >
              Confirm & Continue
            </Button>
          </div>
        </Box>
      </Paper>
    </div>
  );
}