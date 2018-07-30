const TechHives = artifacts.require("./TechHives.sol");
// let ERC20DividendsToken = artifacts.require("./ERC20DividendsToken.sol");
const web3 = global.web3;

const tw = v => web3.toBigNumber(v).mul(1e18);
//const tw = web3._extend.utils.toWei;
const fw = v => web3._extend.utils.fromWei(v).toString();


contract('TechHives', (accounts) => {

    //initial params for testing

    const CREATOR = accounts[0];
    const TEST_VALUE = tw(100);
    const TEST_ETH_VALUE = tw(2);

    beforeEach(async () => {
        tech = await TechHives.new({from: CREATOR});
    });

    it("should allow to mint new tokens to owner (creators) and do it only for mintBalance", async () => {
        let supBefore = await tech.totalSupply();
        await tech.mint(CREATOR, TEST_VALUE, {from: CREATOR});
        let supNow = await tech.totalSupply();
        assert((supBefore.plus(TEST_VALUE)).eq(supNow));
        await tech.mint(CREATOR, tw(24900), {from: CREATOR});
        let supNowNow = await tech.totalSupply();
        assert((supNow.plus(tw(24900))).eq(supNowNow));
        try {
            await tech.mint(CREATOR, tw(1), {from: CREATOR});
        }

        catch (e) {

        }
        let supNowNowNow = await tech.totalSupply();
        assert(supNowNow.eq(supNowNowNow));
    });

    it("should calculate dividends correctly for new investors", async () => {
        await tech.mint(CREATOR, TEST_VALUE, {from: CREATOR});
        await tech.acceptDividends(TEST_ETH_VALUE, {from: accounts[1], value: TEST_ETH_VALUE});
        let sumOnInvestorDividends = TEST_ETH_VALUE;
        let contractSumOnInvestorDividends = await tech.dividendsRightsOf(CREATOR);
        assert(contractSumOnInvestorDividends.eq(sumOnInvestorDividends));
    });

    it("should calculate dividends correctly for new investors x2", async () => {
        await tech.mint(CREATOR, TEST_VALUE, {from: CREATOR});


    });
});