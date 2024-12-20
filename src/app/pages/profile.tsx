import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useRouter } from 'next/router';

export default function Profile() {
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth');
      }

      try {
        const response = await axios.get('/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage(response.data.message);
      } catch (error) {
        router.push('/auth');
      }
    };

    fetchProfile();
  }, []);

  return (
    <div>
      <h1>Profile</h1>
      <p>{message}</p>
    </div>
  );
}
