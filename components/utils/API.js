/**
 * API.js
 *
 * This file contains helper functions to interact with the REST API endpoints
 * provided by the Yii2 backend for both challenges and users.
 *
 * Endpoints:
 *
 * 1. createChallenge(challengeData)
 *    - Method: POST /challenge/create
 *    - Description: Creates a new challenge.
 *    - Expected Payload: JSON object with keys: owner, opponent, date, discipline, race_length, break_type,
 *      and optionally handicap, handicap_who, firsttobreak, timer, total_time.
 *    - Returns: An object with success status and created challengeId.
 *
 * 2. acceptChallenge(challengeId)
 *    - Method: POST /challenge/accept
 *    - Description: Accepts a challenge by updating its status to "accepted".
 *    - Expected Payload: JSON object with key: challengeId.
 *    - Returns: An object indicating success.
 *
 * 3. counterOfferChallenge(challengeData)
 *    - Method: POST /challenge/counter-offer
 *    - Description: Submits a counter-offer for a challenge.
 *    - Expected Payload: JSON object with challengeId and any fields to update (e.g., date, discipline, race_length, break_type, handicap, handicap_who).
 *    - Returns: An object indicating success.
 *
 * 4. declineChallenge(challengeId, challengedUserName)
 *    - Method: POST /challenge/decline
 *    - Description: Declines a challenge. Optionally, you can provide the challengedUserName.
 *    - Expected Payload: JSON object with challengeId and optionally challengedUserName.
 *    - Returns: An object indicating success.
 *
 * 5. getMatches()
 *    - Method: GET /challenge/matches
 *    - Description: Retrieves all challenge records without any filtering.
 *      Client-side code is responsible for mapping and filtering the data.
 *    - Returns: An array of challenge objects.
 *
 * 6. getCurrentChallenges(userId)
 *    - Method: GET /challenge/current?userId=USER_ID
 *    - Description: Retrieves current (incomplete) challenges for the given user.
 *    - Returns: An array of challenge objects.
 *
 * 7. getAcceptedChallenges(userId)
 *    - Method: GET /challenge?userId=USER_ID
 *    - Description: Retrieves all challenges with status "accepted". If a userId is provided,
 *      only challenges where the user is either the owner or the opponent are returned.
 *    - Returns: An array of accepted challenge objects.
 *
 * 8. getChallengeStats(userId)
 *    - Method: GET /challenge/stats?userId=USER_ID
 *    - Description: Retrieves statistics for the given user including total challenges,
 *      wins, and losses.
 *    - Returns: An object with keys: total, wins, losses.
 *
 * 9. getUsers(ids, fields)
 *    - Method: GET /user?ids=1,2,3&fields=id,full_name,avatar
 *    - Description: Retrieves a list of users. You can filter by an array of user IDs and specify which fields to return.
 *    - Returns: An array of user objects.
 *
 * 10. getUser(id, fields)
 *    - Method: GET /user/view?id=USER_ID&fields=id,email
 *    - Description: Retrieves details for a single user with optional field filtering.
 *    - Returns: A user object.
 *
 * 11. saveUser(userData)
 *    - Method: POST /user/save
 *    - Description: Creates or updates a user.
 *    - Returns: The response data.
 *
 * 12. getFcmToken(userId), getFbToken(userId), upsertFbToken(userId, fbToken, expiryDate), upsertFcmToken(userId, fcmToken)
 *    - Methods to retrieve or upsert push notification tokens.
 */

const API_BASE_URL = "https://co-stream.com.au"; // Change this to your actual API base URL if needed

// Helper function to handle responses from fetch
async function handleResponse(response) {
  if (response.ok) {
    console.log(response.text);
  }
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }
  return response.json();
}

/**
 * Create a new challenge.
 * POST /challenge/create
 *
 * @param {Object} challengeData - Object containing challenge details.
 * Expected keys: owner, opponent, date, discipline, race_length, break_type,
 * optionally: handicap, handicap_who, firsttobreak, timer, total_time.
 * @returns {Promise<Object>} The response from the API.
 */
export async function createChallenge(challengeData) {
  const response = await fetch(`${API_BASE_URL}/challenge/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(challengeData),
  });
  return handleResponse(response);
}

/**
 * Accept an existing challenge.
 * POST /challenge/accept
 *
 * @param {string|number} challengeId - The ID of the challenge to accept.
 * @returns {Promise<Object>} The response from the API.
 */
export async function acceptChallenge(challengeId) {
  const response = await fetch(`${API_BASE_URL}/challenge/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ challengeId }),
  });
  return handleResponse(response);
}

/**
 * Submit a counter-offer for a challenge.
 * POST /challenge/counter-offer
 *
 * @param {Object} challengeData - Object containing challengeId and any updated fields.
 * @returns {Promise<Object>} The response from the API.
 */
export async function counterOfferChallenge(challengeData) {
  const response = await fetch(`${API_BASE_URL}/challenge/counter-offer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(challengeData),
  });
  return handleResponse(response);
}

/**
 * Decline a challenge.
 * POST /challenge/decline
 *
 * @param {string|number} challengeId - The ID of the challenge to decline.
 * @param {string} [challengedUserName] - (Optional) The username of the challenged user.
 * @returns {Promise<Object>} The response from the API.
 */
export async function declineChallenge(challengeId, challengedUserName) {
  const data = { challengeId };
  if (challengedUserName) {
    data.challengedUserName = challengedUserName;
  }
  const response = await fetch(`${API_BASE_URL}/challenge/decline`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function getMatches({
  userId,
  opponentId,
  complete,
  status,
} = {}) {
  let url = `${API_BASE_URL}/challenge/matches`;
  const params = new URLSearchParams();

  if (userId) {
    params.append("user_id", userId);
    if (opponentId) {
      params.append("opponent_id", opponentId);
    }
  }

  if (complete) {
    // Expecting complete to be either 'complete' or 'incomplete'
    params.append("complete", complete);
  }

  if (status) {
    // Expecting status to be one of 'pending', 'accepted', 'declined', 'counterOffer'
    params.append("status", status);
  }

  if ([...params].length > 0) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);
  return handleResponse(response);
}

/**
 * Retrieve accepted challenges.
 * GET /challenge?userId=USER_ID
 *
 * If userId is provided, only challenges where the user is either the owner or opponent are returned.
 *
 * @param {string|number} [userId] - (Optional) The user ID to filter by.
 * @returns {Promise<Array>} An array of accepted challenges.
 */
export async function getAcceptedChallenges(userId = "") {
  const url = userId
    ? `${API_BASE_URL}/challenge?userId=${userId}`
    : `${API_BASE_URL}/challenge`;
  const response = await fetch(url);
  return handleResponse(response);
}

/**
 * Retrieve challenge statistics for a given user.
 * GET /challenge/stats?userId=USER_ID
 *
 * Returns statistics including total challenges, wins, and losses.
 *
 * @param {string|number} userId - The user ID.
 * @returns {Promise<Object>} An object with keys: total, wins, losses.
 */
export async function getChallengeStats(userId) {
  const response = await fetch(
    `${API_BASE_URL}/challenge/stats?userId=${userId}`
  );
  return handleResponse(response);
}

// /**
//  * Retrieve a list of users.
//  * GET /user?ids=1,2,3&fields=id,full_name,avatar
//  *
//  * @param {Array<string|number>} [ids] - (Optional) Array of user IDs.
//  * @param {Array<string>} [fields] - (Optional) Array of fields to include.
//  * @returns {Promise<Array>} An array of user objects.
//  */
// export async function getUsers(ids = [], fields = []) {
//   const idsParam = ids.length > 0 ? ids.join(',') : '';
//   const fieldsParam = fields.length > 0 ? fields.join(',') : '';
//   const url = `${API_BASE_URL}/user?ids=${idsParam}&fields=${fieldsParam}`;
//   const response = await fetch(url);
//   return handleResponse(response);
// }

// /**
//  * Retrieve details for a single user.
//  * GET /user/view?id=USER_ID&fields=id,email
//  *
//  * @param {string|number} id - The user ID.
//  * @param {Array<string>} [fields] - (Optional) Array of fields to include.
//  * @returns {Promise<Object>} A user object.
//  */
export async function getUser(id) {
  const url = `${API_BASE_URL}/user?ids=${id}&fields=full_name,avatar`;
  const response = await fetch(url);
  return handleResponse(response);
}

// /**
//  * Save a user (create a new user or update an existing user).
//  * POST /user/save
//  *
//  * @param {Object} userData - An object containing user details.
//  * @returns {Promise<Object>} A promise that resolves with the response data.
//  */
// export async function saveUser(userData) {
//   const response = await fetch(`${API_BASE_URL}/user/save`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(userData)
//   });
//   return handleResponse(response);
// }

// /**
//  * Retrieve the FB token for a given user.
//  * GET /user/get-fb-token?id=USER_ID
//  *
//  * @param {string|number} userId - The user ID.
//  * @returns {Promise<Object>} An object containing the FB token data.
//  */
// export async function getFbToken(userId) {
//   const response = await fetch(`${API_BASE_URL}/user/get-fb-token?id=${userId}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   });
//   return handleResponse(response);
// }

/**
 * POST request to upsert an FCM token.
 * It sends user_id, fcm_token, and an optional device_type to your API.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} fcmToken - The FCM token.
 * @param {string} [deviceType] - The device type (e.g., "android", "ios").
 * @returns {Promise<Object>} - The response JSON from the API.
 */
export async function upsertFcmToken(userId, fcmToken, deviceType = null) {
  const url = `${API_BASE_URL}/user/upsert-fcm-token`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        fcm_token: fcmToken,
        device_type: deviceType,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error upserting FCM token");
    }
    return data;
  } catch (error) {
    console.error("upsertFcmToken error:", error);
    throw error;
  }
}

/**
 * GET request to fetch the FCM token for a user.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} - The response JSON from the API.
 */
export async function getFcmToken(userId) {
  // Note: Adjust the query param if your endpoint expects a different key (e.g., "userId" or "id")
  const url = `${API_BASE_URL}/user/get-fcm-token?userId=${encodeURIComponent(
    userId
  )}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error fetching FCM token");
    }
    return data;
  } catch (error) {
    console.error("getFcmToken error:", error);
    throw error;
  }
}

export const exchangeFbToken = async (shortLivedToken, userId) => {
  // Build the URL with query parameters
  const url = `${API_BASE_URL}/user/exchange-token?access_token=${encodeURIComponent(
    shortLivedToken
  )}&user_id=${encodeURIComponent(userId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  console.log("Exchange Facebook token response:", data);

  return handleResponse(response);
};
