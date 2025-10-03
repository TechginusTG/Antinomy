import { useState, useCallback } from 'react';

export const useSearchPop = () => {
    const [popover, setPopover] = useState({
        visible: false,
        keyword: '',
        hoveredWordId: null,
    });

    const showPopover = useCallback((word, wordId) => {
        const cleanedWord = word.replace(/[.,\/#!$%^&*;:{}=\-_`~()]/g, "").trim();
        if (!cleanedWord || cleanedWord.length < 2) return;

        setPopover({
            visible: true,
            keyword: cleanedWord,
            hoveredWordId: wordId,
        });
    }, []);

    const hidePopover = useCallback(() => {
        setPopover((prev) => ({ ...prev, visible: false, hoveredWordId: null, keyword: '' }));
    }, []);

    return { popover, showPopover, hidePopover };
};
