// resources/js/Components/Staff/SearchContext.jsx
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searchError, setSearchError] = useState(null);

    const searchUser = async (name, phone, email) => {
        try {
            const token = Cookies.get('auth_token');
            if (!token) {
                throw new Error('Không tìm thấy token xác thực');
            }

            // setSearchQuery(`${name} ${phone}`);
            setSearchError(null);

            const response = await axios.get('/api/findUserbystaff', {
                params: { name, phone, email },
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.message === 'User found') {
                setSearchResults(response.data.user);
            } else {
                setSearchResults(null);
                setSearchError('User not found');
            }
        } catch (err) {
            setSearchError('Failed to search user');
            setSearchResults(null);
        }
    };

    // Thêm hàm resetSearch
    const resetSearch = () => {
        setSearchResults(null);
        setSearchError(null);
        setSearchQuery(''); // Reset cả searchQuery nếu cần
    };

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery, searchUser, searchResults, searchError, resetSearch }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
};