import Power_chart from "./Power_chart";
import Sales_chart from "./Sales_chart";


const Chart = () => {
    return (
        <>
            <div className="container" style={{ paddingBottom: '5%' }}>
                <Power_chart />
            </div>

            <div className="container">
                <Sales_chart />
            </div>
        </>
    )

};

export default Chart;