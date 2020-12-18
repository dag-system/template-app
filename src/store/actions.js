import { ADD_TODO, LOGIN, LOGOUT } from '../actionTypes'


/**
 * Add a new beer
 * @param {object} data The beer data
 */
export const addBeer = data => {
	return {
		type: ADD_BEER,
		data,
	};
};

export const login = data => {
	return {
		type: LOGIN,
		data,
	};
};

export const logout = data => {
	return {
		type: LOGOUT,
		data,
	};
};