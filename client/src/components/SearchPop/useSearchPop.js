import { useState, useCallback } from 'react';

export const useSearchPop = () => {
    const [popover, setPopover] = useState({
        visible: false,
        hoveredWordId: null,
    });

    const showPopover = useCallback((word, wordId) => {
        if (!word || word.length < 2) return;

        setPopover({
            visible: true,
            hoveredWordId: wordId,
        });
    }, []);

    const hidePopover = useCallback(() => {
        setPopover({ visible: false, hoveredWordId: null });
    }, []);

    return { popover, showPopover, hidePopover };
};