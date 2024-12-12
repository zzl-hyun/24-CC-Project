import axios from 'axios';

const API_BASE_URL = 'http://113.198.66.75:10232'; // .env에서 가져오기
console.log(API_BASE_URL);

// Fear and Greed Index 가져오기
export const fetchFearGreedIndex = async () => {
  try {
    const response = await axios.get('https://api.alternative.me/fng/?limit=1');
    return response.data.data[0].value;
  } catch (error) {
    console.error('Error fetching Fear and Greed Index:', error);
    throw error;
  }
};

// 유저 데이터 가져오기
export const fetchUsersData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      return response.data.users; 
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

// 유저 데이터 가져오기
export const fetchUserData = async (currentUser) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${currentUser}`);
      const user = response.data.user;
      if (!user) {
        console.warn('No user data found in response');
        return {}; // 기본값 반환
      }
      return user;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };
  
