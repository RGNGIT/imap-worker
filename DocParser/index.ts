import ApproRxDetailsParser from "./lib/approRxDetailsParser";

const start = async () => {
    await new ApproRxDetailsParser().parseAll();
}

start();