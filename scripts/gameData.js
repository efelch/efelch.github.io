"use strict";
const headerElement = document.getElementById('site-header');
const headerText = headerElement ? headerElement.textContent.trim() + "\n\n" : "";

const itemData = {
    ...personalData.items,
    ...houseData.items,
    ...forestData.items,
    ...caveData.items,
    ...templeData.items,
    ...townData.items
};

const roomHints = {
    ...personalData.hints,
    ...houseData.hints,
    ...forestData.hints,
    ...caveData.hints,
    ...templeData.hints,
    ...townData.hints
};

const rooms = {
    ...personalData.rooms,
    ...houseData.rooms,
    ...forestData.rooms,
    ...caveData.rooms,
    ...templeData.rooms,
    ...townData.rooms
};
