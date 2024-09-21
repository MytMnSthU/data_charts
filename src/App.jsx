
import { useEffect, useRef, useState, useMemo } from "react";
import MapBgImage from "./components/MapBgImage";
import SearchIcon from "./components/SearchIcon";
import Card from "./components/Card";

import { debounce, functions } from 'lodash';

const CloseBtn = ({ clearSearchInput }) => {
    return (
        <button type="button" className="p-2" onClick={clearSearchInput}>
            <svg
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g id="Menu / Close_LG">
                    <path
                        id="Vector"
                        d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001"
                        stroke="#8decb4ce"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </g>
            </svg>
        </button>
    )
}

function App() {
    const defaultVisibleCount = 10;

    const [populationData, setPopulationData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [visibleData, setVisibleData] = useState(defaultVisibleCount);
    const searchInputRef = useRef(null);

    const [titles, ...rows] = populationData.length > 0 ? populationData : [];

    const formattedPopulationData = populationData.length > 0 && rows.map((row) => generatePopulationDataObject(titles, row));

    const searchedData = useMemo(() => {
        if (!formattedPopulationData) return []
        if (!setSearchTerm.length === 0) return formattedPopulationData.slice(0, visibleData)

        return formattedPopulationData.filter(data => data.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [formattedPopulationData, searchTerm])

    const slicedData = searchedData.slice(0, visibleData);

    function generatePopulationDataObject(titles, data) {
        let rowObj = {};
        let dataItems = [];

        // Remove some uncessary tittles
        function isExcludedTitle(title) {
            return title === "Series Code" || title === "Series Name";
        }

        // Find year title
        function isYearTitle(title) {
            return isNaN(parseInt(title));
        }

        // Edit year title format
        function extractYearFromTitle(title) {
            return title.split(" ")[0];
        }

        titles.forEach((title, idx) => {
            // console.log(title, data[idx]);
            if (isExcludedTitle(title)) return;

            if (!isYearTitle(title)) {
                if (!data[idx]) return;
                let cellObj = {};
                let simpleTitle = extractYearFromTitle(title);

                cellObj["year"] = simpleTitle;
                cellObj["count"] = data[idx];
                dataItems.push(cellObj);
            } else {
                if (title === "Country Name") {
                    rowObj["name"] = data[idx];
                } else {
                    let uniqueId = data[idx] + Math.floor(Math.random() * 100);
                    rowObj["id"] = uniqueId;
                }
            }

            rowObj["population"] = dataItems;
        });

        return rowObj;
    }

    // ? How do you undestand debounce ?
    // * to avoid multiple events in the same time
    // * for example, search box when we create search feature no need to click to search,
    // * it reacts each of user input(letters eg. dog-> d, o, g)
    // * it is slow, it will be more true that it need more hard work not smart work
    // * With debounce, it does not do as soon as user input, it wait some custom time to do 
    // * it's feature
    // * That's is how I understand debounce at 4232024
    const debounceSearch = useRef(
        debounce((term) => {
            setSearchTerm(term)
        }, 1000)
    ).current

    function handleSearchInput() {
        const inputVal = searchInputRef.current.value;
        let currSearchTerm = inputVal.trim();
        debounceSearch(currSearchTerm);
    }

    function clearSearchInput() {
        // clear search input field
        searchInputRef.current.value = "";

        // clear search term
        debounceSearch("");
    }

    function loadMoreData() {
        setVisibleData(data => data + 10);
    }

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await fetch("population.csv");

                if (!res.ok) {
                    throw new Error(res.status);
                }

                const csv = await res.text();
                const rows = csv.split("\n");
                const data = rows.map((row) => row.split(","));

                // When we change csv to text, it's original double quotes are included.
                // so it need to remove
                const removedDoubleQuoteData = data.map((sData) =>
                    sData.map((item) => item.replace(/"/g, ""))
                );

                // Remove carriage return from items
                const removedEscapeData = removedDoubleQuoteData.map((rows) =>
                    rows.map((cell) => cell.replace(/\r/g, ""))
                );

                setPopulationData(removedEscapeData);
                return removedEscapeData;
            } catch (error) {
                console.error("Fetch", error);
            }
        };

        getData();
    }, []);

    return (
        <>
            <header className="bg-slate-700/50 backdrop-blur-xl w-full px-[20px] py-[10px] fixed top-0 start-0 z-10">
                <div className=" max-w-[1200px] mx-auto flex flex-wrap justify-between items-center gap-x-[100px] gap-y-[20px]">
                    <h1 className=" font-medium text-lg text-primary">
                        Country population on the earth.
                    </h1>

                    <div className=" bg-slate-600/50 grow flex gap-1 items-center p-[5px] rounded-full border-2 border-transparent focus-within:border-primary">
                        <SearchIcon />

                        <input
                            ref={searchInputRef}
                            type="text"
                            className=" bg-transparent text-primary text-base outline-none grow placeholder:text-[14px] "
                            placeholder="Search..."
                            // onChange={() => debounce(handleSearchInput(), 2000)}
                            onChange={handleSearchInput}

                        />

                        {searchTerm && <CloseBtn clearSearchInput={clearSearchInput} />}
                    </div>
                </div>
            </header>

            <MapBgImage />

            <main className=" bg-transparent min-h-screen backdrop-blur-sm px-[20px] py-[50px] pt-[150px] sm:pt-[100px]">
                <div className="  max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5 ">
                    {slicedData.length > 0 ? slicedData.map(data => <Card key={data.id} data={data} />) : <p className=" fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">Looks like a ghost town here. Try another search. 👻</p>}
                </div>

                {visibleData < searchedData.length && <button type="button" className=" block mx-auto mt-5 bg-slate-700/50 px-8 py-3 rounded-full outline-none border-2 border-transparent focus-visible:border-primary hover:bg-slate-700/40" onClick={loadMoreData}>More</button>}
            </main>
        </>
    );
}

export default App;
