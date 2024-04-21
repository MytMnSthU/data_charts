import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { PuffLoader } from "react-spinners";

import { useEffect, useState } from "react";

const primaryColor = "#8decb4ce";
const secondaryColor = "#90ab9b";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Card = ({ data }) => {
    const [isChartLoaded, setIsChartLoaded] = useState(false);

    const preparedData = {
        labels: data.population.map((row) => row.year),
        datasets: [
            {
                label: data.name,
                data: data.population.map((row) => row.count),
                borderColor: primaryColor,
                backgroundColor: primaryColor,
            },
        ],
    };

    const defaultOption = {
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
    };

    const handleChartLoading = () => {
        setIsChartLoaded(true);
    };

    useEffect(() => {
        handleChartLoading();
    }, [isChartLoaded]);

    return (
        <div className=" rounded-lg">
            {!isChartLoaded ? (
                <div className=" h-[200px] grid place-items-center">
                    <PuffLoader color="#8decb4ce" />
                </div>
            ) : (
                <>
                    <div className="p-2">
                        <h4 className=" text-primary text-lg">{data.name}</h4>
                    </div>
                    <hr className=" border-t-primary" />
                </>
            )}
            <Line data={preparedData} options={defaultOption} onLoad={handleChartLoading} />
        </div>
    );
};

export default Card;
