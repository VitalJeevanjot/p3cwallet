<template>
<q-page padding>
  <!-- style='background-image: linear-gradient(white, #00bbff);' -->
  <div class="row justify-center q-ma-sm">
    <q-btn @click="openCreateCropModal()" v-if="!isRegistered" rounded class="bg-indigo-8 text-white text-overline q-ma-sm" label="Create Crop" />
  </div>
  <q-dialog v-model="openCreateCropEtcValueToSpentDialog" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">Available {{typeBalance}} {{getDynBalance}}</div>
        <div class="text-caption">Max Fee <span class="text-red">0.001200011</span> ETC</div>
      </q-card-section>
      <q-form
        @submit="onSubmit"
        @reset="onReset"
        class="q-gutter-md"
      >
      <q-card-section>
        <q-input dense v-model="valueToSpend" type="number" step="0.01" min="0.01" autofocus @keyup.enter="openCreateCropEtcValueToSpentDialog = false"
        lazy-rules
        :rules="[
          val => val !== null && val !== '' || 'Please type something',
          val => val >= 0.01 || 'Please keep atleast 0.01 as Amount',
          val => val <= this.getDynBalance || 'That much Amount is not available'
        ]"
      />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn class="text-green" flat label="Cancel" v-close-popup />
        <q-btn class='text-white' :color="spendEtcBtnColor" :label="btnSpentEtcText" type="submit" />
      </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
  <div class='justify-center' align='center'>
    <span class='text-h5 text-white text-weight-bold'>{{user}}</span>
  </div>
<q-pull-to-refresh v-if='isRegistered' @refresh="refresh">
  <q-card bordered>
    <q-card-section v-if='isRegistered'>
      <span class='text-h6 text-weight-light text-green'>P3C Balance:</span> {{p3cBalance}}
      <!-- Show button to buy p3c with etc if balance is zero -->
    </q-card-section>
      <q-separator inset v-if='isRegistered' />
    <q-card-section v-if='isRegistered'>
      <span class='text-h6 text-weight-light text-green'>IN ETC:</span> {{p3cBalanceInEtc}}
    </q-card-section>
      <q-separator inset v-if='isRegistered' />
    <q-card-section v-if='isRegistered'>
      <span class='text-h6 text-weight-light text-green'>IN USD:</span> ${{p3cBalanceInUsd}}
    </q-card-section>
      <q-separator inset v-if='isRegistered' />
    <q-card-section>
      <span class='text-h6 text-weight-light text-blue'>ETC:</span> {{etcBalance}}
    </q-card-section>
  </q-card>
</q-pull-to-refresh>
  <div class="row justify-center" v-if="etcBalance <= 0">
    <q-btn rounded class="bg-red-8 text-white text-overline q-ma-sm" label="Deposit ETC" />
  </div>
  <div v-if='isRegistered'>
  <q-page-sticky position='bottom-left' :offset='[18, 18]'>
    <q-btn fab-mini icon='arrow_upward' class='bg-green text-white' @click='dialog = true' >
      <q-badge color="green" class="q-ma-sm">Accept</q-badge>
    </q-btn>
  </q-page-sticky>
  <q-page-sticky position='bottom-right' :offset='[18, 18]'>
    <q-btn fab-mini icon='arrow_downward' class='bg-red text-white' @click='dialog=true'>
      <q-badge color="red" class="q-ma-sm">Send</q-badge>
    </q-btn>
  </q-page-sticky>
  </div>
  <q-page-sticky position="bottom" :offset="[18, 18]" v-if='isRegistered'>
    <q-fab
      icon="menu"
      direction="up"
      color="white text-blue"
    >
    <q-chip @click.native="onClick" color="green-4" style="height: max-content;">
      <q-fab-action @click="onClick" color="white text-green" icon="exit_to_app" />
      <span class="text-overline text-white">EXIT</span>
    </q-chip>
    <q-chip color="green-4" style="height: max-content;">
      <q-fab-action @click="onClick" color="white text-green" icon="settings" />
      <span class="text-overline text-white">SETTINGS</span>
    </q-chip>
    <q-chip color="green-4" style="height: max-content;">
      <q-fab-action @click="makeTxs('SELL')" color="white text-red" icon="money_off" />
      <span class="text-overline text-white">SELL</span>
    </q-chip>
    <q-chip color="green-4" style="height: max-content;">
      <q-fab-action @click="makeTxs('BUY')" color="white text-green" icon="attach_money" />
      <span class="text-overline text-white">BUY</span>
    </q-chip>
    <q-chip color="green-4" style="height: max-content;">
      <q-fab-action @click="onClick" color="white text-green" icon="history" />
      <span class="text-overline text-white">History</span>
    </q-chip>
    <q-chip color="green-4" style="height: max-content;">
      <q-fab-action @click="onClick" color="white text-green" icon="open_in_new" />
      <span class="text-overline text-white">Explorer</span>
    </q-chip>
    </q-fab>
  </q-page-sticky>
</q-page>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      dialog: false,
      text: '',
      user: '',
      p3cBalance: '',
      p3cBalanceInEtc: '',
      p3cBalanceInUsd: '',
      etcBalance: '',
      valueToSpend: '0.01',
      walletSaved: this.$q.localStorage.getItem('wallet'),
      privateKey: null,
      walletToGet: null,
      contractWithSigner: null,
      address: null,
      isRegistered: false,
      overrides: null,
      openCreateCropEtcValueToSpentDialog: false,
      farmContractWithSigner: null,
      contractAbiWithSigner: null,
      btnSpentEtcText: 'Create Crop',
      historyTransactions: [],
      spendEtcBtnColor: 'green',
      typeBalance: null,
      getDynBalance: null
    }
  },
  mounted () {
    if (this.$q.localStorage.getItem('historyTrxs')) {
      this.historyTransactions = this.$q.localStorage.getItem('historyTrxs')
    }
    this.$q.loading.show()
    if (!this.$q.localStorage.getItem('overrides') || this.$q.localStorage.getItem('overrides') === null) {
      let wei = this.$ethers.utils.parseEther(this.valueToSpend)
      let feeWei = this.$ethers.utils.parseUnits('1.0', 'gwei')
      this.overrides = {
        // The maximum units of gas for the transaction to use
        gasLimit: 1200011,
        // The price (in wei) per unit of gas
        gasPrice: feeWei._hex,
        // The nonce to use in the transaction
        nonce: 9999,
        // The amount to send with the transaction (i.e. msg.value)
        value: wei,
        // The chain ID (or network ID) to use
        chainId: 61
      }
      this.$q.localStorage.set('overrides', this.overrides)
      let etherString = this.$ethers.utils.formatEther(this.overrides.value)
      this.valueToSpend = parseFloat(etherString).toFixed(2).toString()
    } else {
      // console.log('else')
      // console.log(this.$q.localStorage.getItem('overrides'))
      let etherString = this.$ethers.utils.formatEther(this.$q.localStorage.getItem('overrides').value)
      this.valueToSpend = parseFloat(etherString).toFixed(2).toString()
      // console.log('elsed')
    }
    this.address = this.walletSaved.signingKey.address
    this.privateKey = this.walletSaved.signingKey.keyPair.privateKey
    this.walletToGet = new this.$ethers.Wallet(this.privateKey, this.$etcProvider)
    // Getting ETC Balance...
    this.getETCBalance()
    // Getting contract...
    let farmContract = new this.$ethers.Contract(this.$contracts.farm.address, this.$contracts.farm.abi, this.$etcProvider)
    // console.log(farmContract)
    this.farmContractWithSigner = farmContract.connect(this.walletToGet)
    this.getMyCrop()
  },
  methods: {
    refresh (done) {
      this.getcontractInfo()
      this.getETCBalance()
      setTimeout(() => {
        done()
      }, 2000)
    },
    async getMyCrop () {
      let cropAddress = await this.farmContractWithSigner.myCrop()
      if (cropAddress === '0x0000000000000000000000000000000000000000') {
        this.isRegistered = false
        this.btnSpentEtcText = 'Create Crop'
        this.getETCBalance()
      } else {
        this.isRegistered = true
        this.btnSpentEtcText = 'Buy P3C'
        this.$q.localStorage.set('cropAddress', cropAddress)
        let cropAbi = new this.$ethers.Contract(cropAddress, this.$contracts.crop.abi, this.$etcProvider)
        this.cropAbi = cropAbi.connect(this.walletToGet)
        this.getcontractInfo()
        this.getETCBalance()
      }
      // console.log(currentValue)
    },
    async getcontractInfo () {
      // if balance is zero then show a button to buy p3c
      let currentValue = await this.farmContractWithSigner.myCropTokens()
      let realBalance = parseFloat(this.$ethers.utils.formatEther(currentValue))
      this.p3cBalance = parseFloat(this.$ethers.utils.formatEther(currentValue)).toFixed(2).toString()
      this.$axios('https://api.p3c.io/chart/info').then((res) => {
        this.p3cBalanceInEtc = ((res.data.PriceETC * 0.8) * realBalance).toFixed(3)
        this.p3cBalanceInUsd = ((res.data.PriceUSD * 0.8) * realBalance).toFixed(3)
      })
      // console.log(this.p3cBalance)
    },
    async getETCBalance () {
      // if balance is zero then show a button to buy p3c
      this.$etcProvider.getBalance(this.address).then((balance) => {
        // balance is a BigNumber (in wei); format is as a sting (in ether)
        let etherString = this.$ethers.utils.formatEther(balance)
        this.etcBalance = parseFloat(etherString).toFixed(3).toString()
        this.$q.loading.hide()
        // console.log(this.etcBalance)
      })
    },
    async createCrop () {
      this.$q.loading.show()
      try {
        let currentValue = await this.farmContractWithSigner.createCrop(this.$referrer, false, this.$q.localStorage.getItem('overrides'))
        this.$q.loading.hide()
        console.log(currentValue)
        if (currentValue.hash) {
          this.historyTransactions.push({ etcSpent: this.valueToSpend, hash: currentValue.hash })
          this.$q.localStorage.set('historyTrxs', this.historyTransactions)
          this.$q.notify({
            message: 'Transaction Successful, Pull to refresh...',
            color: 'green'
          })
        } else {
          this.$q.notify({
            message: 'A problem occured while sending transaction but check blockExplorer First.',
            color: 'warning'
          })
        }
        this.openCreateCropEtcValueToSpentDialog = false
      } catch (err) {
        this.openCreateCropEtcValueToSpentDialog = false
        this.$q.notify({
          message: err,
          color: 'red'
        })
        console.log(err)
      }
    },
    async buyP3C () {
      this.$q.loading.show()
      this.openCreateCropEtcValueToSpentDialog = false
      let boughtP3C = await this.cropAbi.buy(this.$referrer, this.$q.localStorage.getItem('overrides'))
      console.log(boughtP3C)
      if (boughtP3C.hash) {
        this.historyTransactions.push({ etcSpent: this.valueToSpend, hash: boughtP3C.hash })
        this.$q.localStorage.set('historyTrxs', this.historyTransactions)
        this.$q.notify({
          message: 'Transaction Successful, Pull to refresh...',
          color: 'green'
        })
      } else {
        this.$q.notify({
          message: 'A problem occured while sending transaction but check blockExplorer First.',
          color: 'warning'
        })
      }
      this.$q.loading.hide()
    },
    async sellP3C () {
      this.$q.loading.show()
      this.openCreateCropEtcValueToSpentDialog = false
      let sellingP3CAmount = this.$ethers.utils.parseEther(this.valueToSpend)
      let feeWei = this.$ethers.utils.parseUnits('1.0', 'gwei')
      let overrides = {
        // The maximum units of gas for the transaction to use
        gasLimit: 1200011,
        // The price (in wei) per unit of gas
        gasPrice: feeWei._hex,
        // The nonce to use in the transaction
        // The chain ID (or network ID) to use
        chainId: 61
      }
      let soldP3C = await this.cropAbi.sell(sellingP3CAmount._hex, overrides)
      console.log(soldP3C)
      if (soldP3C.hash) {
        this.historyTransactions.push({ etcSpent: this.valueToSpend, hash: soldP3C.hash })
        this.$q.localStorage.set('historyTrxs', this.historyTransactions)
        this.$q.notify({
          message: 'Transaction Successful, Pull to refresh...',
          color: 'green'
        })
      } else {
        this.$q.notify({
          message: 'A problem occured while sending transaction but check blockExplorer First.',
          color: 'warning'
        })
      }
      this.$q.loading.hide()
    },
    openBuyP3CDialog () {
      this.openCreateCropEtcValueToSpentDialog = true
    },
    onClick () {
      console.log('Clicked on a fab action')
    },
    openCreateCropModal () {
      this.openCreateCropEtcValueToSpentDialog = true
    },
    setOvrride () {
      let feeWei = this.$ethers.utils.parseUnits('1.0', 'gwei')
      let valueWei = this.$ethers.utils.parseEther(this.valueToSpend)
      this.overrides = {
        // The maximum units of gas for the transaction to use
        gasLimit: 1200011,
        // The price (in wei) per unit of gas
        gasPrice: feeWei._hex,
        // The nonce to use in the transaction
        // The amount to send with the transaction (i.e. msg.value)
        value: valueWei._hex,
        // The chain ID (or network ID) to use
        chainId: 61
      }
      console.log(this.overrides)
      this.$q.localStorage.set('overrides', this.overrides)
    },
    onSubmit () {
      // #=> ETC Transfer
      // let amount = this.$ethers.utils.parseEther(this.valueToSpend)

      // let tx = {
      //   to: '0x7474C6597FDe2675f3Dce76dEDB2ae93D1FfBbBB',
      //   // ... or supports ENS names
      //   // to: "ricmoo.firefly.eth",
      //   // We must pass in the amount as wei (1 ether = 1e18 wei), so we
      //   // use this convenience function to convert ether to wei.
      //   value: amount._hex,
      //   chainId: 61
      // }
      // let sendPromise = this.walletToGet.sendTransaction(tx)
      // sendPromise.then((tx) => {
      //   console.log(tx)
      //   // {
      //   //    // All transaction fields will be present
      //   //    "nonce", "gasLimit", "pasPrice", "to", "value", "data",
      //   //    "from", "hash", "r", "s", "v"
      //   // }
      // })

      // #=> Creating crop
      console.log('in submit')
      if (this.btnSpentEtcText === 'Create Crop') {
        this.setOvrride()
        this.createCrop()
      } else if (this.btnSpentEtcText === 'Buy P3C') {
        this.setOvrride()
        this.buyP3C()
      } else if (this.btnSpentEtcText === 'Sell P3C') {
        this.setOvrride()
        this.sellP3C()
      }
    },
    onReset () {

    },
    makeTxs (txsType) {
      if (txsType === 'SELL') {
        this.btnSpentEtcText = 'Sell P3C'
        this.spendEtcBtnColor = 'red'
        this.typeBalance = 'P3C'
        this.getDynBalance = this.p3cBalance
        this.openCreateCropEtcValueToSpentDialog = true
      } else if (txsType === 'BUY') {
        this.btnSpentEtcText = 'Buy P3C'
        this.spendEtcBtnColor = 'green'
        this.typeBalance = 'ETC'
        this.getDynBalance = this.etcBalance
        this.openCreateCropEtcValueToSpentDialog = true
      } else if (txsType === 'CREATE') {
        this.btnSpentEtcText = 'Create Crop'
        this.spendEtcBtnColor = 'orange'
        this.typeBalance = 'ETC'
        this.getDynBalance = this.etcBalance
        this.openCreateCropEtcValueToSpentDialog = true
      }
    }
  }
}
</script>

<style>
</style>
