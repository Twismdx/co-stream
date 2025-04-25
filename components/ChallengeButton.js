import React from 'react';
import { Button } from 'react-native';
import { createChallenge } from '../components/utils/API';
import { useGlobalContext } from './timer/context';

const ChallengeButton = ({ opponentId }) => {
  const { user } = useGlobalContext();

  const handleChallenge = async () => {
    if (user) {
      // Prepare minimal challenge data.
      const challengeData = {
        owner: user.id,                     // The challenge creator.
        opponent: opponentId,               // The challenged user.
        date: new Date().toISOString(),     // Current date/time.
        discipline: '8-ball',               // Default discipline.
        race_length: 11,                    // Default race length.
        break_type: 'winner',               // Default break type.
        status: 'pending',                  // Initial status.
      };

      try {
        const result = await createChallenge(challengeData);
        if (result.error) {
          throw new Error(result.error);
        }
        alert('Challenge sent!');
      } catch (error) {
        console.error('Error creating challenge:', error);
        alert('Error sending challenge');
      }
    } else {
      alert('User not authenticated');
    }
  };

  return <Button title="Challenge" onPress={handleChallenge} />;
};

export default ChallengeButton;
