const headerElement = document.getElementById('site-header');
const headerText = headerElement ? headerElement.textContent.trim() + "\n\n" : "";

const itemData = {
    ...houseData.items,
    ...forestData.items,
    ...caveData.items,
    ...townData.items
};

const roomHints = {
    ...houseData.hints,
    ...forestData.hints,
    ...caveData.hints,
    ...townData.hints
};

const rooms = {
    ...houseData.rooms,
    ...forestData.rooms,
    ...caveData.rooms,
    ...townData.rooms
};
