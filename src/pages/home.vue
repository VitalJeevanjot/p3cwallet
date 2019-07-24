<template>
<q-page padding>
  <!-- style='background-image: linear-gradient(white, #00bbff);' -->
  <div class="row justify-center q-ma-sm">
    <q-btn @click="openCreateCropModal()" v-if="!isRegistered" rounded class="bg-indigo-8 text-white text-overline q-ma-sm" label="Create Crop" />
  </div>
  <q-dialog v-model="openCreateCropEtcValueToSpentDialog" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">Available Balance {{etcBalance}}</div>
        <div class="text-caption">Max Fee <span class="text-red">0.000023</span> ETC</div>
      </q-card-section>
      <q-form
        @submit="onSubmit"
        @reset="onReset"
        class="q-gutter-md"
      >
      <q-card-section>
        <q-input dense v-model="etcToSpent" type="number" step="0.01" min="0.01" autofocus @keyup.enter="openCreateCropEtcValueToSpentDialog = false"
        lazy-rules
        :rules="[
          val => val !== null && val !== '' || 'Please type something',
          val => val >= 0.01 || 'Please keep atleast 0.05 to buy p3c worth of that much ETC',
          val => val <= this.etcBalance || 'That much ETC are not available'
        ]"
      />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn class="text-green" flat label="Cancel" v-close-popup />
        <q-btn class="text-white bg-green" label="Create Crop" type="submit" />
      </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
  <q-dialog persistent v-model='dialog' position='top'>
    <q-card style='width: 500px'>
      <q-card-section class='row items-center no-wrap'>
        <div style='width: 90vw'>
          <q-input class='justify-center' filled v-model='text' label='Username' />
        </div>
        <q-space />
        <q-btn round icon='done' class='text-blue q-ml-sm' close-popup @click='findUser()' />
        <q-btn round icon='close' class='text-blue q-ml-sm' close-popup @click='dialog=false' />
      </q-card-section>
    </q-card>
  </q-dialog>
  <div class='justify-center' align='center'>
    <span class='text-h5 text-white text-weight-bold'>{{user}}</span>
  </div>
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
  <div class="row justify-center" v-if="etcBalance <= 0">
    <q-btn rounded class="bg-red-8 text-white text-overline q-ma-sm" label="Deposit ETC" />
  </div>
  <div v-if='isRegistered'>
  <q-page-sticky position='bottom-left' :offset='[18, 18]'>
    <q-btn fab-mini icon='arrow_upward' class='bg-green text-white' @click='dialog=true' />
  </q-page-sticky>
  <q-page-sticky position='bottom-right' :offset='[18, 18]'>
    <q-btn fab-mini icon='arrow_downward' class='bg-red text-white' @click='dialog=true' />
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
      <q-fab-action @click="onClick" color="white text-red" icon="money_off" />
      <span class="text-overline text-white">SELL</span>
      </q-chip>
    <q-chip color="green-4" style="height: max-content;">
      <q-fab-action @click="onClick" color="white text-green" icon="attach_money" />
      <span class="text-overline text-white">BUY</span>
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
      etcToSpent: '0.01',
      walletSaved: this.$q.localStorage.getItem('wallet'),
      privateKey: null,
      walletToGet: null,
      contractWithSigner: null,
      address: null,
      isRegistered: false,
      overrides: null,
      openCreateCropEtcValueToSpentDialog: false
    }
  },
  mounted () {
    this.$q.loading.show()
    if (!this.$q.localStorage.getItem('overrides') || this.$q.localStorage.getItem('overrides') === null) {
      let wei = this.$ethers.utils.parseEther(this.etcToSpent)
      let feeWei = this.$ethers.utils.parseUnits('1.0', 'gwei')
      this.overrides = {
        // The maximum units of gas for the transaction to use
        gasLimit: 150000,
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
      this.etcToSpent = parseFloat(etherString).toFixed(2).toString()
    } else {
      console.log('else')
      console.log(this.$q.localStorage.getItem('overrides'))
      let etherString = this.$ethers.utils.formatEther(this.$q.localStorage.getItem('overrides').value)
      this.etcToSpent = parseFloat(etherString).toFixed(2).toString()
      console.log('elsed')
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
    async getMyCrop () {
      let cropAddress = await this.farmContractWithSigner.myCrop()
      if (cropAddress === '0x0000000000000000000000000000000000000000') {
        this.isRegistered = false
        this.getETCBalance()
      } else {
        this.isRegistered = true
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
        this.$q.notify({
          message: 'The transaction is processing...',
          color: 'green'
        })
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
    onClick () {
      console.log('Clicked on a fab action')
    },
    openCreateCropModal () {
      this.openCreateCropEtcValueToSpentDialog = true
    },
    onSubmit () {
      // #=> ETC Transfer
      // let amount = this.$ethers.utils.parseEther(this.etcToSpent)

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
      // ask for fee in dialog
      let feeWei = this.$ethers.utils.parseUnits('1.0', 'gwei')
      let valueWei = this.$ethers.utils.parseEther(this.etcToSpent)
      console.log(feeWei._hex, valueWei._hex)
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
      this.createCrop()
    },
    onReset () {

    }
  }
}
</script>

<style>
</style>
