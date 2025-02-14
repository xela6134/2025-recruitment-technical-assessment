'use client';

import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, Squares2X2Icon, BookOpenIcon, MoonIcon, FunnelIcon, BarsArrowDownIcon } from "@heroicons/react/24/solid";

export default function Home() {
  const [buildings, setBuildings] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("data.json");
        const data = await response.json();
        setBuildings(data);
        setFilteredBuildings(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching building data:", error);
      }
    };

    fetchData();
  }, []);

  
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = buildings.filter((building) =>
      building.name.toLowerCase().includes(value)
    );
    setFilteredBuildings(filtered);
  }

  return (
    <div className="flex flex-col">
      {/* Navbar */}
      <div className="flex justify-between h-20 p-2 border-b-2 border-gray-300">
        <div className="flex h-full">
          <img
            src="freeRoomsLogo.png"
            alt="User Image"
            className="mr-1"
          />
          <div className="hidden sm:flex justify-center items-center">
            <p className="text-orange-500 text-4xl font-bold">Freerooms</p>
          </div>
        </div>
        <div className="flex h-full gap-2 items-center">
          <button className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-orange-500 hover:bg-orange-100 transition">
            <MagnifyingGlassIcon className="h-6 w-6 text-orange-500" />
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-lg border-2 bg-orange-500 text-white border-orange-500">
            <Squares2X2Icon className="h-6 w-6 text-white" />
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-orange-500 hover:bg-orange-100 transition">
            <BookOpenIcon className="h-6 w-6 text-orange-500" />
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-orange-500 hover:bg-orange-100 transition">
            <MoonIcon className="h-6 w-6 text-orange-500" />
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center w-full gap-2 sm:gap-4 p-4">
        <button className="hidden sm:flex items-center w-28 justify-center px-4 py-2 border-2 border-orange-500 rounded-lg text-orange-500 hover:bg-orange-100 transition">
          <FunnelIcon className="h-5 w-5 mr-1" />
          <span className="font-semibold">Filters</span>
        </button>
        <div className="flex items-center w-full max-w-[720px] border-2 border-gray-300 rounded-lg px-3 py-2">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search for a building..."
            className="w-full outline-none bg-transparent text-gray-600 placeholder-gray-400"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button className="hidden sm:flex items-center w-28 justify-center px-4 py-2 border-2 border-orange-500 rounded-lg text-orange-500 hover:bg-orange-100 transition">
          <BarsArrowDownIcon className="h-5 w-5 mr-1" />
          <span className="font-semibold">Sort</span>
        </button>

        {/* Small Screen Responsiveness */}
        <div className="flex sm:hidden justify-between w-full gap-2">
          <button className="flex items-center justify-center px-4 py-2 border-2 border-orange-500 rounded-lg text-orange-500 hover:bg-orange-100 transition w-28">
            <FunnelIcon className="h-5 w-5 mr-1" />
            <span className="font-semibold">Filters</span>
          </button>
          <button className="flex items-center justify-center px-4 py-2 border-2 border-orange-500 rounded-lg text-orange-500 hover:bg-orange-100 transition w-28">
            <BarsArrowDownIcon className="h-5 w-5 mr-1" />
            <span className="font-semibold">Sort</span>
          </button>
        </div>
      </div>

      {/* Data Section - Small*/}
      <div className="flex flex-col sm:hidden gap-4 p-4">
        {filteredBuildings.map((building, index) => (
          <div
            key={index}
            className="relative w-full h-36 rounded-lg overflow-hidden shadow-md"
          >
            <img
              src={building.building_picture}
              alt={building.name}
              className="h-full w-full rounded-lg object-cover"
            />

            {/* Made a filter because images feel too bright */}
            <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>

            {/* Building Info */}
            <div className="absolute top-1/2 left-4 text-white font-semibold text-lg">
              {building.name}
            </div>
            <div className="absolute top-1/2 right-4 flex items-center bg-white text-black text-base font-bold px-3 py-1 rounded-full">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              {building.rooms_available} / {building.rooms_available}
            </div>
          </div>
        ))}
        {filteredBuildings.length === 0 && (
          <div className="w-full text-center text-lg">
            No results found.
          </div>
        )}
      </div>

      {/* Data Section - Medium */}
      <div className="hidden sm:grid lg:hidden grid-cols-2 gap-4 p-4">
        {filteredBuildings.map((building, index) => (
          <div
            key={index}
            className="relative w-full h-64 rounded-lg overflow-hidden shadow-md"
          >
            <img
              src={building.building_picture}
              alt={building.name}
              className="h-full w-full rounded-lg object-cover"
            />

            <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
            <div className="absolute bottom-4 left-4 right-4 bg-orange-500 text-white px-4 py-3 rounded-lg">
              {building.name}
            </div>
            <div className="absolute top-3 left-3 flex items-center bg-white text-black text-sm font-bold px-3 py-1 rounded-full">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              {building.rooms_available} rooms available
            </div>
          </div>
        ))}
        {filteredBuildings.length === 0 && (
          <div className="w-full text-center text-lg">
            No results found.
          </div>
        )}
      </div>

      {/* Data Section - Large */}
      <div className="hidden lg:flex flex-wrap justify-center gap-4 p-4">
        {filteredBuildings.map((building, index) => (
          <div
            key={index}
            className="relative w-96 h-96 rounded-lg overflow-hidden shadow-md"
          >
            <img
              src={building.building_picture}
              alt={building.name}
              className="w-full h-full object-cover rounded-lg"
            />

            <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
            <div className="absolute bottom-4 left-4 right-4 bg-orange-500 text-white px-4 py-3 rounded-lg">
              {building.name}
            </div>
            <div className="absolute top-3 left-3 flex items-center bg-white text-black text-sm font-bold px-3 py-1 rounded-full shadow-md">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              {building.rooms_available} rooms available
            </div>
          </div>
        ))}
        {filteredBuildings.length === 0 && (
          <div className="w-full text-center text-lg">
            No results found.
          </div>
        )}
      </div>
    </div>
  );
}
