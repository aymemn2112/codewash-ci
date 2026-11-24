import { SKILL_DATA } from '../constants/gameData';

/**
 * Build the 7 cards shown by the carousel (-3..+3 around the selected index),
 * wrapping around the skill list.
 */
export const getVisibleItems = (selectedIndex, skillData = SKILL_DATA) => {
    const items = [];
    for (let offset = -3; offset <= 3; offset++) {
        const key = selectedIndex + offset;
        let dataIndex = key % skillData.length;
        if (dataIndex < 0) dataIndex += skillData.length;
        items.push({ ...skillData[dataIndex], offset, key });
    }
    return items;
};

export default getVisibleItems;
