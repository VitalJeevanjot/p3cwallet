<template>
<q-page padding :class="`bg-${day_night_bg_color}`">
  <q-header class="text-white" style="background-color: #f5f5f5" align="center" elevated>
      <q-toolbar align="center">
        <q-btn style="cursor: pointer;" fab-mini :icon='day_night_icon' class='bg-grey-1 text-grey-10' @click="changeDayLightMode()">
    </q-btn>
          <q-avatar style=" display: block;
            margin-left: auto;
            margin-right: auto;"
            class = "q-mt-sm"
            size="72px"
            >
            <img style="height: 50px; width: 50px" src="statics/whale.png">
          </q-avatar>
          <q-btn style="cursor: pointer;" fab-mini icon='delete' class='bg-grey-8 text-white' @click="showInsertEncryptionPinDialog=true">
    </q-btn>
      </q-toolbar>
  </q-header>
  <!-- style='background-image: linear-gradient(white, #00bbff);' -->
  <div class="row justify-center q-ma-sm">
    <q-btn style="cursor: pointer;" @click="openCreateCropModal()" v-if="!isRegistered && this.etcBalance > 0" rounded class="bg-indigo-8 text-white text-overline q-ma-sm" label="Create Crop" />
  </div>
  <q-page-sticky position='top-right' :offset='[18, 0]' style="z-index: 1">
  </q-page-sticky>
  <q-dialog v-model="openCreateCropEtcValueToSpentDialog" persistent>
    <q-card :class="`bg-${day_night_bg_card_color} text-${day_night_text_color}`">
      <q-card-section>
        <div class="text-h6">Available <span class="text-green" v-if="typeBalance == 'P3C'"> {{typeBalance}} </span> <span class="text-blue" v-if="typeBalance == 'ETC' || typeBalance == 'etc'"> {{typeBalance}} </span> {{getDynBalance}}</div>
        <div class="text-caption">Max Fee <span class="text-red">0.001200011</span> ETC</div>
      </q-card-section>
      <q-form
        @submit="onSubmit"
        @reset="onReset"
        class="q-gutter-md"
        autofocus
      >
      <q-card-section v-if="sendingP3C" class="bg-white">
        <q-input dense v-model="p3cReceiver" label="P3C Crop of Receiver" type="text"
        lazy-rules
        :rules="[
          val => val !== null && val !== '' || 'Please type P3C Crop address.'
        ]"
      />
      </q-card-section>
      <q-card-section class="bg-white">
        <q-input dense v-model="valueToSpend" label="Amount" type="number" step="0.0001" min="0.0001" autofocus
        lazy-rules
        :rules="[
          val => val !== null && val !== '' || 'Please type something',
          val => val >= 0.0001 || 'Please keep atleast 0.0001 as Amount',
          val => val < this.getDynBalance || 'That much Amount is not available'
        ]"
      />
      </q-card-section>
      <q-card-section class="bg-white">
        <q-input dense v-model="p3cPairerReceiver" label="Crop of Pair (optional)" type="text"
        :disable="disablePairField"
        lazy-rules
      >
      </q-input>
      </q-card-section>
      <q-card-section class="bg-white">
        <div class="q-gutter-sm">
          <q-checkbox v-model="useDefaultRef" label="Use Default Pair" @input="p3cDefaultPairer"/>
          <q-icon
            name="info"
            color="blue"
            size="30px"
            class="cursor-pointer"
            @click="pairerInfoDialog=true"
          />
        </div>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn style="cursor: pointer;" class="text-green" flat label="Cancel" v-close-popup />
        <q-btn style="cursor: pointer;" class='text-white' :color="spendEtcBtnColor" :label="btnSpentEtcText" type="submit" />
      </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
  <!-- Pair Info Dialog -->
     <q-dialog v-model="pairerInfoDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">How Pairing Works</div>
        </q-card-section>

        <q-card-section>
          <span class="text-bold">Regular mode</span> - Whenever P3C is bought or sold, 10% goes to community. <br>
          <span class="text-bold">Pair mode</span> - Whenever P3C is bought, 7% goes to community, 3% goes to Pair <br>
          <br>
          <span class="text-weight-light">Using Default Pair will send 3% to developer but you are free to change it or you can untick default and leave the field blank to choose community as your 10% reward.</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  <div class='justify-center' align='center'>
    <span class='text-h5 text-white text-weight-bold'>{{user}}</span>
  </div>
<q-pull-to-refresh @refresh="refresh">
  <q-card bordered :class="`bg-${day_night_bg_card_color}  text-${day_night_text_color} text-white`">
    <q-card-section v-if='isRegistered'>
      <span class='text-h6 text-weight-light text-green'>My P3C Balance:</span> {{p3cBalance}}
    </q-card-section>
    <q-card-section v-if='isRegistered'>
      <span class='text-h6 text-weight-light text-green'>My P3C Dividends:</span> {{p3cDividends}} <span class="text-overline text-grey-7"> (in compound mode) </span>
      <q-btn style="cursor: pointer;" v-if="p3cDividends > 0" class="q-ml-sm text-white bg-white text-grey-8" icon="get_app" round @click="withdrawDividendsP3C()"></q-btn>
    </q-card-section>
      <q-separator inset v-if='isRegistered' />
    <q-card-section v-if='isRegistered'>
      <span class='text-h6 text-weight-light text-green'>IN ETC:</span> {{p3cBalanceInEtc}}
    </q-card-section>
    <q-card-section v-if='isRegistered'>
      <span class='text-h6 text-weight-light text-green'>IN USD:</span> ${{p3cBalanceInUsd}}
    </q-card-section>
      <q-separator inset v-if='isRegistered' />
    <q-card-section>
      <span class='text-h6 text-weight-light text-purple'>ETC:</span> {{etcBalance}}
      <q-btn style="cursor: pointer;" class="q-ml-sm text-white text-grey-6" @click="openExplorer('ETC')" icon="open_in_new" round></q-btn>
    </q-card-section>
  </q-card>
</q-pull-to-refresh>
  <div class="row justify-center" v-if="etcBalance <= 0 && decryptedData">
    <q-btn style="cursor: pointer;" rounded @click="showWalletViewEtc = true" class="bg-red-8 text-white text-overline q-ma-sm" label="Deposit ETC" />
  </div>
  <div class="row justify-center" v-if="!decryptedData">
    <q-btn style="cursor: pointer;" rounded to="/" class="bg-red-8 text-white text-overline q-ma-sm" label="Go Back" />
  </div>
  <div class="q-mb-xl" align="center" style="width: 90vw">
    <line-chart :chart-data="datacollection"></line-chart>
  </div>
  <div v-if='isRegistered'>
  <q-page-sticky position='bottom-left' :offset='[18, 18]'>
    <q-btn style="cursor: pointer;" fab-mini icon='arrow_upward' class='bg-green text-white' @click="showOnlyP3CCropAddress = true" >
    </q-btn>
  </q-page-sticky>
  <q-page-sticky position='bottom-right' :offset='[18, 18]'>
    <q-btn style="cursor: pointer;" fab-mini icon='arrow_downward' class='bg-blue text-white' @click="makeTxs('SEND')">
    </q-btn>
  </q-page-sticky>
  </div>
  <q-page-sticky position="bottom" :offset="[18, 18]" v-if='isRegistered'>
    <q-fab
      icon="menu"
      direction="up"
      :color="`white bg-${day_night_text_color} text-${day_night_bg_card_color}`"
    >
    <q-chip color="grey-8" style="height: max-content;">
      <q-fab-action @click="showWalletViewEtc = true" color="white text-green" icon="account_balance_wallet" />
      <span class="text-overline text-white">Wallet</span>
    </q-chip>
    <q-chip color="grey-8" style="height: max-content;">
      <q-fab-action @click="makeTxs('SELL')" color="white text-red" icon="money_off" />
      <span class="text-overline text-white">SELL</span>
    </q-chip>
    <q-chip color="grey-8" style="height: max-content;">
      <q-fab-action @click="makeTxs('BUY')" color="white text-green" icon="attach_money" />
      <span class="text-overline text-white">BUY</span>
    </q-chip>
    <q-chip color="grey-8" style="height: max-content;">
      <q-fab-action @click="showHistoryDialog = true" color="white text-green" icon="history" />
      <span class="text-overline text-white">History</span>
    </q-chip>
    <q-chip color="grey-8" style="height: max-content;">
      <q-fab-action @click="openExplorer('P3C')" color="white text-green" icon="open_in_new" />
      <span class="text-overline text-white">Explorer</span>
    </q-chip>
    </q-fab>
  </q-page-sticky>
  <!-- Dialog for showing history -->
  <q-dialog
      v-model="showHistoryDialog"
      persistent
      :maximized="true"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
    <q-card class="bg-grey-2 text-green-9">
      <q-btn style="cursor: pointer;" dense flat icon="close" v-close-popup>
        <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
      </q-btn>
      <q-card-section>
    <q-markup-table dark class="bg-indigo-8">
      <thead>
        <tr>
          <th class="text-left">Type</th>
          <th class="text-right">Value</th>
          <th class="text-right">Token</th>
          <th class="text-left">Hash</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="txs in historyTransactions" :key="txs.hash">
          <td class="text-left">{{txs.type}}</td>
          <td class="text-right">{{txs.valueSpent}}</td>
          <td class="text-right" v-if="txs.inP3C">P3C</td>
          <td class="text-right" v-if="!txs.inP3C">ETC</td>
          <td >
           <q-btn style="cursor: pointer;" round class="text-green-5 bg-grey-1" icon="open_in_new" @click="openHashTxs(txs.hash)">
           </q-btn>
          </td>
        </tr>
      </tbody>
    </q-markup-table>
        </q-card-section>
    </q-card>
  </q-dialog>
 <q-dialog
      v-model="showWalletViewEtc"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card :class="`bg-${day_night_bg_color} text-blue-9`">
        <q-bar class="bg-white">
          <q-space />
          <q-btn style="cursor: pointer;" dense flat icon="close" v-close-popup>
            <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>
      <div v-if="walletSaved">
        <q-card-section>
          <div class="text-h6 row justify-center">ETC Wallet
            </div>
        </q-card-section>
        <q-card-section align="center">
          <span class="text-red">Address (Please store it yourself safely)</span>
        <q-input id="wallet-account" class="bg-white" standout @click.native="copyText('wallet-account')" v-model="walletSaved.signingKey.address" readonly>
        <template v-slot:prepend>
          <q-icon name="file_copy" />
        </template>
        </q-input>
        <div class="row justify-center q-ma-sm">
         <q-btn style="cursor: pointer;" class="text-blue-6 bg-white" @click="openExplorer('ETC')" round icon="launch" />
        </div>
        </q-card-section>
        <q-card-section align="center">
          <span class="text-red">Public Key (Please store it yourself safely)</span>
        <q-input id="wallet-public" class="bg-white" standout v-model="walletSaved.signingKey.publicKey" @click.native="copyText('wallet-public')" readonly>
        <template v-slot:prepend>
          <q-icon name="file_copy" />
        </template>
        </q-input>
        </q-card-section>
      <q-card-section align="center">
        <span class="text-red">Private Key and Seed (Please store it yourself safely)</span>
        <q-input id="wallet-private" class="bg-white" standout v-model="walletSaved.signingKey.privateKey" @click.native="copyText('wallet-private')" :type="isPwd ? 'password' : 'text'" readonly>
        <template v-slot:prepend>
          <q-icon name="file_copy" />
        </template>
        </q-input>
        <q-input id="wallet-seed" class="bg-white q-mt-md" standout v-model="walletSaved.signingKey.mnemonic" @click.native="copyText('wallet-seed')" :type="isPwd ? 'password' : 'text'" readonly>
          <template v-slot:prepend>
            <q-icon name="file_copy" />
          </template>
        </q-input>
        </q-card-section>
        <q-card-section align="center">
        <q-btn style="cursor: pointer;" round color="green-9" @click="isPwd = !isPwd">
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer text-white"
          />
          </q-btn>
        </q-card-section>
        <q-card-section align="center" v-if="isRegistered">
        <span class="text-red">P3C Crop Address (Please store it yourself safely)</span>
        <q-input id="wallet-p3c-a" class="bg-white" standout v-model="p3cCropAddress" @click.native="copyText('wallet-p3c-a')" readonly>
        <template v-slot:prepend>
          <q-icon name="file_copy" />
        </template>
        </q-input>
        <div class="row justify-center q-ma-sm">
         <q-btn style="cursor: pointer;" class="text-green bg-white" @click="openExplorer('P3C')" round icon="launch" />
        </div>
        </q-card-section>
        </div>
      </q-card>
    </q-dialog>

 <q-dialog
      v-model="showOnlyP3CCropAddress"
      persistent
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card :class="`bg-${day_night_bg_card_color}`">
        <q-bar :class="`bg-${day_night_bg_card_color} text-${day_night_text_color}`">
          <q-space />
          <q-btn style="cursor: pointer;" dense flat icon="close" v-close-popup>
            <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section align="center" v-if="isRegistered">
        <span class="text-red">P3C Crop Address (Send it to the P3C sender to receive P3C)</span>
        <q-input class="bg-white" id="wallet-p3c" standout v-model="p3cCropAddress" @click.native="copyText('wallet-p3c')" readonly>
        <template v-slot:prepend>
          <q-icon name="file_copy" />
        </template>
        </q-input>
        <div class="row justify-center q-ma-sm">
         <q-btn style="cursor: pointer;" class="text-green bg-white" @click="openExplorer('P3C')" round icon="launch" />
        </div>
        </q-card-section>
      </q-card>
    </q-dialog>
<!-- Dialog for deleting account -->
<q-dialog v-model="showInsertEncryptionPinDialog" persistent>
  <q-card style="min-width: 300px">
    <q-card-section>
      <div class="text-h6 text-weight-light"> <q-icon color="red" name="warning" /> Deleting your account is irreversable, You sure you want to continue? Make sure you have saved your private key safe. Then enter your pin and click Delte My Accoun Button</div>
    </q-card-section>

    <q-card-section>
      <q-form
        @submit="onEncryption"
        @reset="onReset"
        class="q-gutter-md"
        autofocus
      >
      <q-input dense
         rounded outlined filled type="text"
          v-model="encryptionPin" autofocus
          mask= "#-#-#-#"
      >
      </q-input>
      <q-card-actions align="right" class="text-primary">
        <q-btn style="cursor: pointer;" flat label="Close" v-close-popup />
        <q-btn style="cursor: pointer;" class="bg-red text-white" label="Delete Wallet" type="submit" />
    </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</q-dialog>
</q-page>
</template>

<script>
import LineChart from './LineChart.js'

export default {
  name: 'home',
  components: {
    LineChart
  },
  data () {
    return {
      dialog: false,
      text: '',
      user: '',
      p3cBalance: '',
      p3cBalanceInEtc: '',
      p3cBalanceInUsd: '',
      etcBalance: '',
      p3cDividends: '',
      valueToSpend: '0.01',
      walletSaved: null,
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
      getDynBalance: null,
      sendingP3C: false,
      p3cReceiver: '',
      showHistoryDialog: false,
      showWalletViewEtc: false,
      isPwd: true,
      p3cCropAddress: '',
      showOnlyP3CCropAddress: false,
      decryptedData: null,
      showInsertEncryptionPinDialog: false,
      encryptionPin: '',
      datacollection: null,
      chartDataFromApi: null,
      chartDatesFromApi: [],
      chartOpenPricesFromApi: [],
      day_night_icon: 'brightness_5',
      day_night_bg_card_color: 'white',
      day_night_bg_color: 'white',
      day_night_text_color: 'black',
      p3cPairerReceiver: '',
      useDefaultRef: true,
      disablePairField: true,
      pairerInfoDialog: false
    }
  },
  mounted () {
    this.p3cPairerReceiver = this.$referrer
    this.$axios.get('https://api.p3c.io/chart/ohlc').then((res) => {
      this.chartDataFromApi = res.data
      // // console.log(this.chartDataFromApi)
      for (let index = 0; index < this.chartDataFromApi.length; index++) {
        this.chartDatesFromApi.push(this.chartDataFromApi[index].Date)
        this.chartOpenPricesFromApi.push(this.chartDataFromApi[index].Open)
      }
      this.fillData()
    })
    // ETC Wallet
    // // console.log(cipher)
    if (!this.$q.localStorage.getItem('wallet')) {
      this.$router.push('/')
    }
    var bytes = this.$cryptojs.AES.decrypt(this.$q.localStorage.getItem('wallet'), this.$q.sessionStorage.getItem('PinEnr'))
    // console.log(bytes)
    this.$q.loading.hide()
    try {
      this.decryptedData = JSON.parse(bytes.toString(this.$cryptojs.enc.Utf8))
    } catch (err) {
      // console.log(err)
      this.$q.loading.hide()
    }
    // console.log(this.decryptedData)
    if (this.decryptedData) {
      this.walletSaved = this.decryptedData
    } else {
      this.$q.notify({
        color: 'red',
        icon: 'warning',
        message: 'Pin is not correct, Kindly go back and enter right pin.'
      })
      this.$q.loading.hide()
      return
    }
    if (this.$q.platform.is.cordova) {
      window.StatusBar.backgroundColorByHexString('#424242')
    }
    if (this.$q.localStorage.getItem('historyTrxs')) {
      this.historyTransactions = this.$q.localStorage.getItem('historyTrxs')
      // console.log(this.historyTransactions)
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
      // // console.log('else')
      // // console.log(this.$q.localStorage.getItem('overrides'))
      let etherString = this.$ethers.utils.formatEther(this.$q.localStorage.getItem('overrides').value)
      this.valueToSpend = parseFloat(etherString).toFixed(2).toString()
      // // console.log('elsed')
    }
    this.address = this.walletSaved.signingKey.address
    this.privateKey = this.walletSaved.signingKey.keyPair.privateKey
    this.walletToGet = new this.$ethers.Wallet(this.privateKey, this.$etcProvider)
    window.address = this.address
    // Getting ETC Balance...
    this.getETCBalance()
    // Getting contract...
    let farmContract = new this.$ethers.Contract(this.$contracts.farm.address, this.$contracts.farm.abi, this.$etcProvider)
    // // console.log(farmContract)
    this.farmContractWithSigner = farmContract.connect(this.walletToGet)
    this.getMyCrop()
  },
  methods: {
    p3cDefaultPairer (val) {
      if (val) {
        this.disablePairField = true
        this.p3cPairerReceiver = this.$referrer
      } else {
        this.disablePairField = false
        this.p3cPairerReceiver = ''
      }
    },
    changeDayLightMode () {
      if (this.day_night_icon === 'brightness_5') {
        this.day_night_icon = 'brightness_6'
        this.day_night_bg_card_color = 'grey-10'
        this.day_night_bg_color = 'white'
        this.day_night_text_color = 'white'
        this.$eventReg('Mode', 'Change Day Light Medium Mode', 'Mid')
      } else if (this.day_night_icon === 'brightness_6') {
        this.day_night_icon = 'brightness_7'
        this.day_night_bg_card_color = 'grey-10'
        this.day_night_bg_color = 'grey-10'
        this.day_night_text_color = 'white'
        this.$eventReg('Mode', 'Change Day Light Medium Mode', 'Black')
      } else if (this.day_night_icon === 'brightness_7') {
        this.day_night_icon = 'brightness_5'
        this.day_night_bg_card_color = 'white'
        this.day_night_bg_color = 'white'
        this.day_night_text_color = 'black'
        this.$eventReg('Mode', 'Change Day Light Medium Mode', 'White')
      }
    },
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
        this.$eventReg('GetData', 'Get My Crop Fired', 'No Crop right now!')
      } else {
        this.isRegistered = true
        this.btnSpentEtcText = 'Buy P3C'
        this.$q.localStorage.set('cropAddress', cropAddress)
        this.p3cCropAddress = cropAddress
        // // console.log(cropAddress)
        let cropAbi = new this.$ethers.Contract(cropAddress, this.$contracts.crop.abi, this.$etcProvider)
        this.cropAbi = cropAbi.connect(this.walletToGet)
        this.getcontractInfo()
        this.getETCBalance()
        this.$eventReg('GetData', 'Get My Crop Fired', this.p3cCropAddress)
      }
      // // console.log(currentValue)
    },
    async getcontractInfo () {
      // if balance is zero then show a button to buy p3c
      let currentValue = await this.farmContractWithSigner.myCropTokens()
      let p3cdivs = await this.farmContractWithSigner.myCropDividends()
      let realBalance = parseFloat(this.$ethers.utils.formatEther(currentValue))
      this.p3cBalance = parseFloat(this.$ethers.utils.formatEther(currentValue)).toFixed(3).toString()
      this.p3cDividends = parseFloat(this.$ethers.utils.formatEther(p3cdivs)).toFixed(8).toString()
      this.$axios('https://api.p3c.io/chart/info').then((res) => {
        this.p3cBalanceInEtc = ((res.data.PriceETC * 0.8) * realBalance).toFixed(3)
        this.p3cBalanceInUsd = ((res.data.PriceUSD * 0.8) * realBalance).toFixed(3)
        this.$eventReg('GetData', 'Get My Crop Balance Fired', 'Current Value: ' + this.p3cBalance + ' \nIn USD: ' + this.p3cBalanceInUsd + ' \nIn ETC: ' + this.p3cBalanceInEtc + '\nDividends: ' + this.p3cDividends)
      })
      // // console.log(this.p3cBalance)
    },
    async getETCBalance () {
      // if balance is zero then show a button to buy p3c
      this.$etcProvider.getBalance(this.address).then((balance) => {
        // balance is a BigNumber (in wei); format is as a sting (in ether)
        let etherString = this.$ethers.utils.formatEther(balance)
        this.etcBalance = parseFloat(etherString).toFixed(3).toString()
        this.$q.loading.hide()
        this.$eventReg('GetData', 'Get ETC Balance Fired', this.etcBalance)
        // // console.log(this.etcBalance)
      })
    },
    async createCrop () {
      this.$q.loading.show()
      try {
        let currentValue
        // if cheked use default pairer (Which always is at start)
        let pAddr
        try {
          pAddr = this.$ethers.utils.getAddress(this.p3cPairerReceiver)
        } catch (err) {
          // console.log(err)
        }
        if (pAddr) {
          currentValue = await this.farmContractWithSigner.createCrop(this.p3cPairerReceiver, false, this.$q.localStorage.getItem('overrides'))
          this.$eventReg('SetData', 'Create Crop Fired', 'Self Buy: false' + ' \nPairer Used: ' + this.p3cPairerReceiver + ' \nValue in ETC: ' + this.$ethers.utils.formatEther(this.$q.localStorage.getItem('overrides').value))
        } else {
          currentValue = await this.farmContractWithSigner.createCrop(this.p3cPairerReceiver, true, this.$q.localStorage.getItem('overrides'))
          this.$eventReg('SetData', 'Create Crop Fired', 'Self Buy: true' + ' \nPairer Used: ' + this.p3cPairerReceiver + ' \nValue in ETC: ' + this.$ethers.utils.formatEther(this.$q.localStorage.getItem('overrides').value))
        }
        this.$q.loading.hide()
        if (currentValue.hash) {
          this.historyTransactions.push({ type: 'Create Crop', inP3C: false, valueSpent: this.valueToSpend, hash: currentValue.hash })
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
          message: 'Problem making transaction, Possible error: Insufficient funds, Check logs to get proper info to report.',
          color: 'red'
        })
        this.$q.loading.hide()
        // console.log(err)
      }
    },
    async buyP3C () {
      let boughtP3C
      let pAddr
      try {
        pAddr = this.$ethers.utils.getAddress(this.p3cPairerReceiver)
      } catch (err) {
        // console.log(err)
      }
      if (pAddr) {
        boughtP3C = await this.cropAbi.buy(this.p3cPairerReceiver, this.$q.localStorage.getItem('overrides'))
        this.$eventReg('SetData', 'Buy P3C Fired', 'Pairer Used: ' + this.p3cPairerReceiver + ' \nBought in ETC: ' + this.$ethers.utils.formatEther(this.$q.localStorage.getItem('overrides').value))
      } else {
        boughtP3C = await this.cropAbi.buy(this.p3cPairerReceiver, this.$q.localStorage.getItem('overrides'))
        this.$eventReg('SetData', 'Buy P3C Fired', 'Pairer Used: ' + this.p3cPairerReceiver + ' \nBought in ETC: ' + this.$ethers.utils.formatEther(this.$q.localStorage.getItem('overrides').value))
      }
      this.$q.loading.show()
      this.openCreateCropEtcValueToSpentDialog = false
      // console.log(boughtP3C)
      if (boughtP3C.hash) {
        this.historyTransactions.push({ type: 'Buy P3C', inP3C: false, valueSpent: this.valueToSpend, hash: boughtP3C.hash })
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
      // console.log(soldP3C)
      if (soldP3C.hash) {
        this.historyTransactions.push({ type: 'Sell P3C', inP3C: true, valueSpent: this.valueToSpend, hash: soldP3C.hash })
        this.$q.localStorage.set('historyTrxs', this.historyTransactions)
        this.$q.notify({
          message: 'Transaction Successful, Pull to refresh...',
          color: 'green'
        })
        this.$eventReg('SetData', 'Sell P3C Fired', 'Selling Amount: ' + this.$ethers.utils.formatEther(sellingP3CAmount._hex) + ' \nOverrides: ' + overrides)
      } else {
        this.$q.notify({
          message: 'A problem occured while sending transaction but check blockExplorer First.',
          color: 'warning'
        })
      }
      this.$q.loading.hide()
    },
    async withdrawDividendsP3C () {
      this.$q.loading.show()
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
      let getDividends = await this.cropAbi.withdraw(overrides)
      // console.log(getDividends)
      if (getDividends.hash) {
        this.historyTransactions.push({ type: 'Withdraw Dividends', inP3C: true, valueSpent: this.valueToSpend, hash: getDividends.hash })
        this.$q.localStorage.set('historyTrxs', this.historyTransactions)
        this.$q.notify({
          message: 'Transaction Successful, Pull to refresh...',
          color: 'green'
        })
        this.$eventReg('SetData', 'Withdraw Dividends P3C Fired', 'Get Dividends: ' + getDividends)
      } else {
        this.$q.notify({
          message: 'A problem occured while sending transaction but check blockExplorer First.',
          color: 'warning'
        })
      }
      this.$q.loading.hide()
    },
    async sendP3C () {
      if (this.p3cReceiver.trim() === this.$q.localStorage.getItem('cropAddress')) {
        this.$q.notify({
          color: 'warning',
          message: 'Do not send p3c to your own address'
        })
      }
      this.$q.loading.show()
      this.openCreateCropEtcValueToSpentDialog = false
      let sendingP3CAmount = this.$ethers.utils.parseEther(this.valueToSpend)
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
      let sentP3C
      try {
        sentP3C = await this.cropAbi.transfer(this.p3cReceiver.trim(), sendingP3CAmount._hex, overrides)
      } catch (err) {
        this.$q.notify({
          message: 'A problem occured while making this transaction.',
          color: 'warning'
        })
        this.$q.loading.hide()
      }
      // console.log(sentP3C)
      if (sentP3C.hash) {
        this.historyTransactions.push({ type: 'Sent P3C', inP3C: true, etcSpent: this.valueToSpend, hash: sentP3C.hash })
        this.$q.localStorage.set('historyTrxs', this.historyTransactions)
        this.$q.notify({
          message: 'Transaction Successful, Pull to refresh...',
          color: 'green'
        })
        this.$eventReg('SetData', 'Send P3C', 'Receiver: ' + this.p3cReceiver.trim() + ' \nSending Amount: ' + this.$ethers.utils.formatEther(sendingP3CAmount._hex))
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
      this.getDynBalance = this.etcBalance
    },
    openCreateCropModal () {
      this.openCreateCropEtcValueToSpentDialog = true
      this.getDynBalance = this.etcBalance
      this.typeBalance = 'ETC'
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
      // console.log(this.overrides)
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
      //   // console.log(tx)
      //   // {
      //   //    // All transaction fields will be present
      //   //    "nonce", "gasLimit", "pasPrice", "to", "value", "data",
      //   //    "from", "hash", "r", "s", "v"
      //   // }
      // })

      // #=> Creating crop
      // console.log('in submit')
      if (this.btnSpentEtcText === 'Create Crop') {
        this.setOvrride()
        this.createCrop()
      } else if (this.btnSpentEtcText === 'Buy P3C') {
        this.setOvrride()
        this.buyP3C()
      } else if (this.btnSpentEtcText === 'Sell P3C') {
        this.setOvrride()
        this.sellP3C()
      } else if (this.btnSpentEtcText === 'Send P3C') {
        this.setOvrride()
        this.sendP3C()
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
        this.sendingP3C = false
        this.openCreateCropEtcValueToSpentDialog = true
      } else if (txsType === 'BUY') {
        this.btnSpentEtcText = 'Buy P3C'
        this.spendEtcBtnColor = 'green'
        this.typeBalance = 'ETC'
        this.getDynBalance = this.etcBalance
        this.sendingP3C = false
        this.openCreateCropEtcValueToSpentDialog = true
      } else if (txsType === 'CREATE') {
        this.btnSpentEtcText = 'Create Crop'
        this.spendEtcBtnColor = 'orange'
        this.typeBalance = 'ETC'
        this.getDynBalance = this.etcBalance
        this.sendingP3C = false
        this.openCreateCropEtcValueToSpentDialog = true
      } else if (txsType === 'SEND') {
        this.btnSpentEtcText = 'Send P3C'
        this.spendEtcBtnColor = 'blue-6'
        this.typeBalance = 'P3C'
        this.getDynBalance = this.p3cBalance
        this.sendingP3C = true
        this.openCreateCropEtcValueToSpentDialog = true
      }
      // console.log(this.btnSpentEtcText.toString())
      this.$eventReg('Dialog Open Operation', this.btnSpentEtcText.toString(), 'opened dialog')
    },
    openExplorer (type) {
      if (type === 'ETC') {
        let url = 'https://blockscout.com/etc/mainnet/address/' + this.decryptedData.signingKey.address
        let win = window.open(url, '_blank')
        win.focus()
      } else {
        let url = 'https://blockscout.com/etc/mainnet/address/' + this.$q.localStorage.getItem('cropAddress')
        let win = window.open(url, '_blank')
        win.focus()
      }
    },
    openHashTxs (txs) {
      let url = 'https://blockscout.com/etc/mainnet/tx/' + txs
      let win = window.open(url, '_blank')
      win.focus()
    },
    shareCropAddress () {

    },
    async copyText (txt) {
      let copyTextarea = document.querySelector(`#${txt}`)
      // // console.log(copyTextarea)
      if (copyTextarea.type !== 'text') {
        this.$q.notify({
          color: 'primary',
          message: 'Please make it visible first!'
        })
        return
      }
      // copyTextarea.setAttribute('type', 'text')
      // // console.log(copyTextarea)
      copyTextarea.disabled = false
      copyTextarea.focus()
      copyTextarea.select()
      try {
        var successful = await document.execCommand('copy')
        // // console.log(successful)
        var msg = successful ? 'to clipboard!' : 'unsuccessfully'
        this.$q.notify({
          color: 'green',
          message: 'Value copied ' + msg
        })
      } catch (err) {
        alert('Oops, unable to copy')
      } finally {
        copyTextarea.disabled = true
      }
    },
    onEncryption () {
      // console.log(this.encryptionPin.length)
      let pin = this.encryptionPin.trim().replace(/-/g, '')
      if (this.$q.sessionStorage.getItem('PinEnr') === pin) {
        this.$q.localStorage.clear()
        this.$q.sessionStorage.clear()
        this.$router.push('/')
      } else {
        this.showInsertEncryptionPinDialog = false
        this.$q.notify({
          color: 'red',
          message: 'Wrong Pin, Do backup your wallet private key manually before deleting it.'
        })
      }
    },
    fillData () {
      this.datacollection = {
        labels: this.chartDatesFromApi,
        datasets: [
          {
            label: 'Open Price [USD]',
            borderColor: '#49b86e',
            borderWidth: 1,
            fill: false,
            pointRadius: 2,
            data: this.chartOpenPricesFromApi
          }
        ]
      }
    }
  }
}
</script>

<style>
</style>
