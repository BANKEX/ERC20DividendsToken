const VendingToken = artifacts.require("./VendingToken.sol");
// let ERC20DividendsToken = artifacts.require("./ERC20DividendsToken.sol");
const web3 = global.web3;

const tw = v => web3.toBigNumber(v).mul(1e18);
//const tw = web3._extend.utils.toWei;
const fw = v => web3._extend.utils.fromWei(v).toString();


contract('VendingToken', (accounts) => {

    //initial params for testing

    beforeEach(async function () {
        vending = await VendingToken.new();
    });

    it("should allow tokenholder to give permission to other account to transfer his tokens", async function() {
        let totalSupply = await vending.totalSupply();
        const account2Balance = tw(0.1);
        const etherSent = tw(1);
        await vending.sendTransaction({ value: tw(1), from: accounts[8]});
        await vending.dividendsRightsOf(accounts[0]);
        let rightsBefore = await vending.dividendsRightsOf(accounts[2])
        await vending.approve(accounts[1], tw(0.2), {from: accounts[0]});
        await vending.transferFrom(accounts[0], accounts[2], account2Balance, {from: accounts[1]});
        await vending.sendTransaction({ value: etherSent, from: accounts[8]});
        let rightsAfter = await vending.dividendsRightsOf(accounts[2])
        assert(rightsAfter.minus(rightsBefore).eq(etherSent.mul(account2Balance).divToInt(totalSupply)));
    })


    it("should return that owner is accounts[0]", async function() {
        assert.equal(await vending.owner(), accounts[0]);
    })

    it("should return total balance = 10 ** 20", async function() {
        const good = tw("100");
        let answer = (await vending.balanceOf(accounts[0]))
        assert(good.eq(answer));
    })

    it("should allow to approve accounts[1-9]", async function() {
        let good = tw("0.1");
        for(let i = 1; i < 9; i++) {
            await vending.approve(accounts[i], good);
            answer = await vending.allowance(accounts[0], accounts[i]);
            assert(good.eq(answer));
        }

    })

    it("should show that account[1] allowed to tranfer 0.1 from account[0]", async function() {
        const good = tw("0.1");
        await vending.approve(accounts[1], good);
        let answer = await vending.allowance(accounts[0], accounts[1])
        assert(good.eq(answer));
    })

    it("should show that account[0] can increase sum which account[1] can transfer", async function() {
        const allowance1 = tw("0.1");
        const allowance2 = tw("0.01");
        const good = allowance1.plus(allowance2);
        await vending.approve(accounts[1], allowance1);
        await vending.increaseApproval(accounts[1], allowance2);
        let answer = await vending.allowance(accounts[0], accounts[1]);
        assert(good.eq(answer));
    })

    it("should show that account[0] can decrease sum which account[1] can transfer", async function() {
        const allowance1 = tw("0.1");
        const allowance2 = tw("0.01");
        const good = allowance1.minus(allowance2);
        await vending.approve(accounts[1], allowance1);
        await vending.decreaseApproval(accounts[1], allowance2);
        let answer = (await vending.allowance(accounts[0], accounts[1])).toString();
        assert(good.eq(answer));
    })

    it("should accept money", async function() {
        const good = tw("0.1");
        await vending.sendTransaction({ value: good, from: accounts[0] });
        let vendingAddress = await vending.address
        assert(good.eq(web3.eth.getBalance(vendingAddress)))
    })

    it("should calculate dividendsRightsOf properly", async function() {
        const good = tw("0.1");
        await vending.sendTransaction({ value: good, from: accounts[0] });
        let answer = await vending.dividendsRightsOf(accounts[0]);
        assert(good.eq(answer));
    })

    it("should allow investor to get his dividends", async function() {
        const good = tw("0.01");
        const gasPrice = tw("2e-8");
        const transactionAmount = tw("0.1");
        await vending.sendTransaction({ value: transactionAmount, from: accounts[3]});
        await vending.dividendsRightsOf(accounts[0]);
        let balance = web3.eth.getBalance(accounts[0])
        let tx = await vending.releaseDividendsRights(good, {gasPrice: gasPrice});
        let gasCost = gasPrice.mul(tx.receipt.gasUsed);
        assert(web3.eth.getBalance(accounts[0]).minus(balance).plus(gasCost).eq(good))
    })


    it("should allow investor to get ALL his dividends", async function() {
        const good = tw("0.1");
        const gasPrice = tw("2e-8");
        await vending.sendTransaction({ value: good, from: accounts[3]});
        await vending.dividendsRightsOf(accounts[0]);
        let balance = web3.eth.getBalance(accounts[0])
        let tx = await vending.releaseDividendsRights(good, {gasPrice: gasPrice});
        let gasCost = gasPrice.mul(tx.receipt.gasUsed);
        assert(web3.eth.getBalance(accounts[0]).minus(balance).plus(gasCost).eq(good))
    })

    it("should allow admin to send dividents of investor by force", async function() {
        const good = tw("0.1");
        const gasPrice = tw("2e-8");
        await vending.sendTransaction({ value: good, from: accounts[3]});
        await vending.dividendsRightsOf(accounts[0]);
        let balance = web3.eth.getBalance(accounts[0])
        let tx = await vending.releaseDividendsRightsForce(accounts[0], good, {gasPrice: gasPrice});
        let gasCost = gasPrice.mul(tx.receipt.gasUsed);
        assert(web3.eth.getBalance(accounts[0]).minus(balance).plus(gasCost).eq(good))

    })

    it("should allow tokenholder to send his tokens to other account && this new token holder can get dividends from new accepted ETH", async function() {
        await vending.sendTransaction({ value: 2e+18, from: accounts[1]});
        let dividentsOfHolder = (await vending.dividendsRightsOf(accounts[0])).toNumber();
        let balanceOfTokenHolder = (await vending.balanceOf(accounts[0])).toNumber();
        let balanceOfNewHolder = (await vending.balanceOf(accounts[2])).toNumber();
        let dividendsOfNewHolder = (await vending.dividendsRightsOf(accounts[2])).toNumber();
        await vending.transfer(accounts[2], balanceOfTokenHolder);
        await vending.sendTransaction({ value: 2e+18, from: accounts[5]});
        let balanceOfNewHolderAfterTransfer = (await vending.balanceOf(accounts[2])).toNumber()
        let dividendsOfNewHolderAfterTransfer = (await vending.dividendsRightsOf(accounts[2])).toNumber();
        assert.equal(((dividendsOfNewHolderAfterTransfer).toString()).substring(0,4), ((dividendsOfNewHolder + dividentsOfHolder).toString()).substring(0,4), "dividents problem")
        assert.equal(balanceOfNewHolderAfterTransfer, balanceOfNewHolder + balanceOfTokenHolder);
        assert.notEqual(balanceOfNewHolderAfterTransfer, balanceOfNewHolder);
        assert.notEqual(dividendsOfNewHolderAfterTransfer, dividendsOfNewHolder)
    })

    it("should allow tokenholder to send his tokens to other accounts && this new token holders can get dividends from new accepted ETH", async function() {
        for (let i = 1; i < 7; i++) {
            await vending.sendTransaction({ value: 2e+18, from: accounts[9]});
            let balances = (await vending.balanceOf(accounts[i])).toNumber();
            let rightsOfAcc = (await vending.dividendsRightsOf(accounts[i])).toNumber();
            let balance = (await vending.balanceOf(accounts[0])).toNumber();
            let dividendsOfHolder = (await vending.dividendsRightsOf(accounts[0])).toNumber();
            await vending.transfer(accounts[i], balance / 10);
            await vending.sendTransaction({ value: 1e+18, from: accounts[9]});
            let balancesNew = (await vending.balanceOf(accounts[i])).toNumber();
            let newRigths = (await vending.dividendsRightsOf(accounts[i])).toNumber();
            assert.notEqual(rightsOfAcc, newRigths);
        }
    })

    // new
    it("should show that account[0] can decrease sum which may be more than account[1] can transfer and allowance would be equal to 0", async function() {
        const allowance1 = tw("0.1");
        const allowance2 = tw("9999999999");
        const good = tw("0");;
        await vending.approve(accounts[1], allowance1);
        await vending.decreaseApproval(accounts[1], allowance2);
        let answer = (await vending.allowance(accounts[0], accounts[1])).toString();
        assert(good.eq(answer));
    });

    it("should check approval (increase, decrease) and transfer allowed funds for variable overflow and bad arguments and checks dividends rights", async function () {
        const allowance1 = tw('1e8');
        const allowance2 = tw('1e7');
        const allowance3 = tw('1e60');
        const allowance4 = tw('1e5');
        const allowance5 = tw('9e59');
        const allowance6 = '5a#4K*';

        const sendValue1 = tw('0.001');
        const sendValue2 = tw('0.231');
        const sendValue3 = tw('1.3463325346456464342342342424243242432');
        const sendValue4 = tw('0.00041463');
        const totalSendWei = sendValue1.plus(sendValue2).plus((sendValue4).mul(100));

        const transferValue1 = '1qq1(82';
        const transferValue2 = tw('1e61');
        const transferValue3 = '-2';
        const transferValue4 = tw('0.12312');
        const transferValue5 = '22222222222.413454647543456543256423453424424534234532435342';
        
        const startBalanceAccount0 = await vending.balanceOf(accounts[0]);

        const goodBalanceAccount0 = tw('100').minus(transferValue4).minus(Math.floor(Number(transferValue5)));
        const goodBalanceAccount1 = '0';
        const goodBalanceAccount2 = transferValue4;
        const goodBalanceAccount3 = web3.toBigNumber(Math.floor(Number(transferValue5)));

        const totalSupply = await vending.totalSupply();

        const goodAllowance = allowance1.minus(allowance2).plus(allowance4).minus(transferValue4).minus(Math.floor(Number(transferValue5)));

        await vending.sendTransaction({ value: sendValue1, from: accounts[8] });

        await vending.approve(accounts[1], allowance1);
        await vending.decreaseApproval(accounts[1], allowance2);
        await vending.decreaseApproval(accounts[1], allowance3);
        await vending.increaseApproval(accounts[1], allowance4);
        await vending.increaseApproval(accounts[1], allowance5);
        
        try {
            await vending.increaseApproval(accounts[1], allowance6);
        } catch (error) {}

        try {
            await vending.transferFrom(accounts[0], accounts[2], transferValue1, { from: accounts[1] });
        } catch (error) {}
        
        await vending.transferFrom(accounts[0], accounts[2], transferValue4, { from: accounts[1] });

        const balanceAccount0AfterFirstTransfer = await vending.balanceOf(accounts[0]);

        await vending.sendTransaction({ value: sendValue2, from: accounts[7] });

        try {
            await vending.transferFrom(accounts[0], accounts[2], transferValue2, { from: accounts[1] });
        } catch (error) {}

        try {
            await vending.transferFrom(accounts[0], accounts[2], transferValue3, { from: accounts[1] });
        } catch (error) {}
       
        await vending.transferFrom(accounts[0], accounts[3], transferValue5, { from: accounts[1] });
        const balanceAccount0AfterSecondTransfer = await vending.balanceOf(accounts[0]);

        try {
            await vending.sendTransaction({value: sendValue3, from: accounts[6] });
        } catch (error) {}


        for (let i = 0; i < 100; i++) {
            await vending.sendTransaction({value: sendValue4, from: accounts[5] });
        }
        
        // these dividends are more than the actual dividends by 20 
        const goodDividendsAccount0 = (startBalanceAccount0.div(totalSupply).mul(sendValue1)).plus((balanceAccount0AfterFirstTransfer.div(totalSupply).mul(sendValue2))).plus(balanceAccount0AfterSecondTransfer.div(totalSupply).mul(sendValue4).mul(100));
        const goodDividendsAccount1 = 0;
        const goodDividendsAccount2 = goodBalanceAccount2.div(totalSupply).mul((sendValue2.plus((sendValue4.mul(100)))));
        // these dividends are less than the actual dividends by 0.00009214 
        const goodDividendsAccount3 = (goodBalanceAccount3.div(totalSupply)).mul(sendValue4).mul(100);  
        // but in total all right
        const goodTotalDividends = goodDividendsAccount0.plus(goodDividendsAccount1).plus(goodDividendsAccount2).plus(goodDividendsAccount3);

        const account1Allowance = (await vending.allowance(accounts[0], accounts[1]));  
            
        const account0Balance = (await vending.balanceOf(accounts[0]));
        const account1Balance = (await vending.balanceOf(accounts[1]));
        const account2Balance = (await vending.balanceOf(accounts[2]));
        const account3Balance = (await vending.balanceOf(accounts[3]));

        const dividends0 = (await vending.dividendsRightsOf(accounts[0]));
        const dividends1 = (await vending.dividendsRightsOf(accounts[1]));
        const dividends2 = (await vending.dividendsRightsOf(accounts[2]));
        const dividends3 = (await vending.dividendsRightsOf(accounts[3]));
        const totalDividends = dividends0.plus(dividends1).plus(dividends2).plus(dividends3);
 
        assert(
            goodAllowance.toNumber() == (account1Allowance).toNumber() && 
            account0Balance.eq(goodBalanceAccount0) && 
            account1Balance.eq(goodBalanceAccount1) && 
            account2Balance.eq(goodBalanceAccount2) && 
            account3Balance.eq(goodBalanceAccount3) &&
            totalDividends.eq(goodTotalDividends) &&
            goodTotalDividends.eq(totalSendWei)
        );
    });

    it("should realise Dividends rights (check for variable overflow and bad arguments)", async function () {
        const gasPrice = tw("2e-8");
    
        const startAccount0Balance = web3.eth.getBalance(accounts[0]);
        const startAccount1Balance = web3.eth.getBalance(accounts[1]);
        const startAccount2Balance = web3.eth.getBalance(accounts[2]);
        const startAccount3Balance = web3.eth.getBalance(accounts[3]);

        const totalSupply = await vending.totalSupply();

        const sendValue1 = tw('0.001');
        const sendValue2 = tw('1');
        const sendValue3 = tw('23.234531');
        const sendValue4 = tw('1.222311111');
        const sendValue5 = tw('11.2131313131');
        const totalSendValue = sendValue1.plus(sendValue2).plus(sendValue3).plus(sendValue4).plus(sendValue5);

        const transferValue1 = tw('1.0001');
        const transferValue2 = tw('0.00120132');
        const transferValue3 = tw('9.9111');
        const transferValue4 = tw('4.347392');

        const releaseDividendsValue1 = tw('0.2');
        const releaseDividendsValue3 = web3.toBigNumber('-1');
        const releaseDividendsValue4 = '2rff3';
        const releaseDividendsValue5 = web3.toBigNumber('1e59');

        const goodDividendsAccount0 = (tw('100').div(totalSupply).mul(sendValue1))
            .plus((tw('100').minus(transferValue1)).div(totalSupply).mul(sendValue2.plus(sendValue3)))
            .plus((tw('100').minus(transferValue1).minus(transferValue3)).div(totalSupply).mul(sendValue4))
            .plus((tw('100').minus(transferValue1).minus(transferValue3).plus(transferValue4)).div(totalSupply).mul(sendValue5));
        const goodDividendsAccount1 = (transferValue1.div(totalSupply).mul(sendValue2))
            .plus((transferValue1.minus(transferValue2)).div(totalSupply).mul(sendValue3.plus(sendValue4).plus(sendValue5)));
        const goodDividendsAccount2 = (transferValue2.div(totalSupply).mul(sendValue3.plus(sendValue4).plus(sendValue5)));
        const goodDividendsAccount3 = (transferValue3.div(totalSupply).mul(sendValue4))
            .plus((transferValue3.minus(transferValue4)).div(totalSupply).mul(sendValue5));
        const totalGoodDividends = goodDividendsAccount0.plus(goodDividendsAccount1).plus(goodDividendsAccount2).plus(goodDividendsAccount3);
 
        await vending.sendTransaction({value: sendValue1, from: accounts[8] });
        await vending.transfer(accounts[1], transferValue1, {gasPrice: gasPrice});
        await vending.sendTransaction({value: sendValue2, from: accounts[7] });
        let tx2Account1 = await vending.transfer(accounts[2], transferValue2, {from: accounts[1], gasPrice: gasPrice});
        await vending.sendTransaction({value: sendValue3, from: accounts[6], gasPrice: gasPrice});
        await vending.transfer(accounts[3], transferValue3, {gasPrice: gasPrice});
        await vending.sendTransaction({value: sendValue4, from: accounts[5]});
        await vending.transfer(accounts[0], transferValue4, {from: accounts[3], gasPrice: gasPrice});
        await vending.sendTransaction({value: sendValue5, from: accounts[4]});

        const balance0 = await vending.balanceOf(accounts[0]);
        const balance1 = await vending.balanceOf(accounts[1]);
        const balance2 = await vending.balanceOf(accounts[2]);
        const balance3 = await vending.balanceOf(accounts[3]);
        const totalBalance = balance0.plus(balance1).plus(balance2).plus(balance3);
       
        const dividends0 = await vending.dividendsRightsOf(accounts[0]);
        const dividends1 = await vending.dividendsRightsOf(accounts[1]);
        const dividends2 = await vending.dividendsRightsOf(accounts[2]);
        const releaseDividendsValue2 = dividends2;
        const dividends3 = await vending.dividendsRightsOf(accounts[3]);
        const totalAllowedDividends = dividends0.plus(dividends1).plus(dividends2).plus(dividends3);

        let txFromAccount1 = await vending.releaseDividendsRights(releaseDividendsValue1, {from: accounts[1], gasPrice: gasPrice});
        
        let txFromAccount2 = await vending.releaseDividendsRights(releaseDividendsValue2, {from: accounts[2], gasPrice: gasPrice});
        try {
            await vending.releaseDividendsRights(releaseDividendsValue3, {from: accounts[3], gasPrice: gasPrice});
        } catch(error) {}
            
        try {
            await vending.releaseDividendsRights(releaseDividendsValue4, {from: accounts[2], gasPrice: gasPrice});
        } catch(error) {}

        try {
            await vending.releaseDividendsRights(releaseDividendsValue5, {from: accounts[3], gasPrice: gasPrice});
        } catch(error) {}
        
        const dividends2AfterReleaseDividendsRights = await vending.dividendsRightsOf(accounts[2]);

        let gasCost11 = gasPrice.mul(tx2Account1.receipt.gasUsed);
        let gasCost1 = gasPrice.mul(txFromAccount1.receipt.gasUsed);
        let gasCost2 = gasPrice.mul(txFromAccount2.receipt.gasUsed);
        
        const balanceAccount0 = await web3.eth.getBalance(accounts[0]);
        const balanceAccount1 = await web3.eth.getBalance(accounts[1]);
        const balanceAccount2 = await web3.eth.getBalance(accounts[2]);
        const balanceAccount3 = await web3.eth.getBalance(accounts[3]);
  
        assert(
            totalAllowedDividends.toNumber() == totalSendValue.toNumber() &&
            totalAllowedDividends.toNumber() == totalGoodDividends.toNumber() &&
            totalBalance.eq(100e18) &&
            balanceAccount1 > startAccount1Balance &&
            dividends2.minus(releaseDividendsValue2).eq(dividends2AfterReleaseDividendsRights) &&
            startAccount2Balance.minus(gasCost2.plus(balanceAccount2).minus(releaseDividendsValue2)).eq(0) &&
            balanceAccount1.plus(gasCost11).plus(gasCost1).minus(releaseDividendsValue1).eq(startAccount1Balance)
        );
    });
});