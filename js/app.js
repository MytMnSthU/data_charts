
(async () => {
    const primaryColor = "#8decb4ce";
    const secondaryColor = "#90ab9b";

    // UI Selection
    const loadingElm = document.getElementById("loading");
    const cardContainer = document.getElementById("cardContainer");
    const searchInput = document.getElementById("search");

    let isLoading = false;

    function showLoading() {
        loadingElm.style.visibility = "visible";
    }
    function hideLoading() {
        loadingElm.style.visibility = "hidden";
    }

    const getData = async () => {
        try {
            const res = await fetch("population.csv");

            if (res.ok) {
                console.log("Success");
                isLoading = true;
                if (isLoading) {
                    hideLoading();
                }
            } else {
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

            return removedEscapeData;
        } catch (error) {
            console.error("Fetch", error);
        }
    };

    const data = await getData();
    const titles = data[0];
    const rows = data.filter((_, idx) => idx !== 0);

    function generatePopulationDataObject(titles, data) {
        let rowObj = {};
        let dataItems = [];

        // Remove some uncessary tittles
        function isExcludedTitle(title) {
            return title === "Country Code" || title === "Series Code" || title === "Series Name";
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
            if (isExcludedTitle(title)) return;

            if (!isYearTitle(title)) {
                if (!data[idx]) return;
                let cellObj = {};
                let simpleTitle = extractYearFromTitle(title);

                cellObj["year"] = simpleTitle;
                cellObj["count"] = data[idx];
                dataItems.push(cellObj);
            } else {
                rowObj["name"] = data[idx];
            }

            rowObj["population"] = dataItems;
        });

        // console.log(rowObj);
        return rowObj;
    }

    const population = rows.map((row) => generatePopulationDataObject(titles, row));

    // console.log(population);

    function createChart(data) {
        // Create chart card and append
        const chartDivElm = document.createElement("div");
        chartDivElm.className = "col-sm-6";
        chartDivElm.innerHTML = `
            <div class="card bg-transparent border-0">
                <div class="card-body">
                    <div class="card-title">
                        <h4>${data.name}</h4>
                    </div>
                    <hr>
                    <canvas></canvas>
                </div>
            </div>`;
        cardContainer.appendChild(chartDivElm);

        // Create bar chart
        new Chart(chartDivElm.querySelector("canvas"), {
            type: "bar",
            data: {
                labels: data.population.map((row) => row.year),
                datasets: [
                    {
                        label: data.name,
                        data: data.population.map((row) => row.count),
                        borderColor: primaryColor,
                        backgroundColor: primaryColor,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: primaryColor,
                            font: {
                                size: 18,
                            },
                        },
                    },
                },
                scales: {
                    y: {
                        ticks: {
                            color: secondaryColor,
                            font: {
                                size: 12,
                            },
                        },
                        grid: {
                            color: secondaryColor,
                            tickColor: secondaryColor,
                        },
                        title: {
                            color: primaryColor,
                            display: true,
                            text: "Populations",
                        },
                    },
                    x: {
                        ticks: {
                            color: secondaryColor,
                            font: {
                                size: 12,
                            },
                        },
                        grid: {
                            color: secondaryColor,
                            tickColor: secondaryColor,
                        },
                        title: {
                            color: primaryColor,
                            display: true,
                            text: "Years",
                        },
                    },
                },
            },
        });
    }

    // Render Charts
    population.forEach((popuData) => createChart(popuData));

    // Event Listen
    searchInput.addEventListener("input", (e) => {
        const searchText = e.target.value.toLowerCase();
        console.log(searchText);
        cardContainer.innerHTML = "";
        isLoading = true;
        showLoading();

        // search country start with user input value
        const filteredCountries = population.filter(({ name }) => {
            const lowercaseName = name.toLowerCase();
            return lowercaseName.includes(searchText);
        });

        if (isLoading) {
            isLoading = false;
            hideLoading();
            filteredCountries.forEach((filteredCountryData) => createChart(filteredCountryData));
        }

        // const cards = document.querySelectorAll(".card");
        // cards.forEach((card) => {
        //     const titleElm = card.children[0].children[0];
        //     const titleText = titleElm.textContent;
        //     console.log(titleText);

        //     if (titleText.includes(searchText)) {
        //         card.style.display = "block";
        //     } else {
        //         card.style.display = "none ";
        //     }
        // });

        // console.log(filteredCountries);
    });
})();
