<template>
  <q-page class="bg-white">
    <div class="row justify-center q-mt-sm">
      <q-btn class="text-blue-5 q-mt-md" style="width:80vw; cursor: pointer; max-width: 500px;" @click="createAccount()" outline align="left" rounded icon="add_circle_outline" label="Create new account" />
    </div>
    <div class="row justify-center q-mt-md">
      <q-btn class="text-blue-5" style="width:80vw; cursor: pointer; max-width: 500px;" @click="importAccountDialog=true" outline rounded align="left" icon="account_circle" label="Import old account" />
    </div>
    <div class="row justify-center q-mt-xl">
      <q-btn class="text-green-5 q-mt-md" style="width:60vw; cursor: pointer; max-width: 400px;" @click="openUrl('https://forum.saturn.network/t/tutorial-how-to-recieve-a-p3c-io-airdrop-on-your-phone-5-minute-tutorial/4144')" outline rounded align="left" icon="info_outline" label="Help Airdrop" />
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn class="text-green-5" style="width:60vw; cursor: pointer; max-width: 400px;" @click="openUrl('https://p3c.io/use.html')" outline rounded align="left" icon="info_outline" label="P3C Website" />
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn class="text-green-5" style="width:60vw; cursor: pointer; max-width: 400px;" @click="openUrl('http://p3c.trade/')" outline rounded align="left" icon="info_outline" label="P3C Trade" />
    </div>

    <q-dialog v-model="importAccountDialog" persistent>
   <q-card>
     <q-card-section class="row items-center justify-center">
       <q-avatar icon="account_circle" color="primary" text-color="white" />
       <span class="q-ml-sm">Click Private Key to add your ETC Wallet private key to this wallet or use 12 words seed.</span>
     </q-card-section>

     <q-card-actions align="right">
       <q-btn style="cursor: pointer;" flat label="Seed" @click="insertSeedDialog=true" color="primary" v-close-popup />
       <q-btn style="cursor: pointer;" flat label="Private Key" @click="insertPrivateKeyDialog=true" color="primary" v-close-popup />
     </q-card-actions>
   </q-card>
 </q-dialog>
 <!-- Dialog for inserting seed -->
 <q-dialog v-model="insertSeedDialog" persistent>
  <q-card style="min-width: 300px">
    <q-card-section>
      <div class="text-h6">Your 12 Words Seed Of Your Existing ETC Wallet.</div>
    </q-card-section>
    <q-form
        @submit="seedAdded"
        @reset="onReset"
        class="q-gutter-md"
      >
    <q-card-section>
      <q-input dense :rules="[val => !!val || 'This Field is required']"
         rounded outlined filled :type="isSeedPwd ? 'password' : 'text'"
          v-model="seedPhrase" autofocus>
          <template v-slot:append>
          <q-icon
            :name="isSeedPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isSeedPwd = !isSeedPwd"
          />
        </template>
      </q-input>
    </q-card-section>

    <q-card-actions align="right" class="text-primary">
      <q-btn style="cursor: pointer;" flat label="Close" v-close-popup />
      <q-btn style="cursor: pointer;" flat label="Add Wallet" type="submit" v-close-popup />
    </q-card-actions>
    </q-form>
  </q-card>
</q-dialog>
 <!-- Dialog for inserting private key -->
 <q-dialog v-model="insertPrivateKeyDialog" persistent>
  <q-card style="min-width: 300px">
    <q-card-section>
      <div class="text-h6">Your Private Key of Existing ETC Wallet.</div>
    </q-card-section>
    <q-form
        @submit="keyAdded"
        @reset="onReset"
        class="q-gutter-md"
      >
    <q-card-section>
      <q-input dense :rules="[val => !!val || 'This Field is required']"
         rounded outlined filled :type="isPwd ? 'password' : 'text'"
          v-model="privatekey" autofocus>
          <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>
    </q-card-section>

    <q-card-actions align="right" class="text-primary">
      <q-btn style="cursor: pointer;" flat label="Close" v-close-popup />
      <q-btn style="cursor: pointer;" flat label="Add Wallet" type="submit" v-close-popup />
    </q-card-actions>
    </q-form>
  </q-card>
</q-dialog>
<!-- Dialog for adding pin -->
<q-dialog v-model="showInsertEncryptionPinDialog" persistent>
  <q-card style="min-width: 300px">
    <q-card-section>
      <div class="text-h6 text-weight-light">Enter 4 Digit Pin. <br/> <q-icon color="red" name="warning"/> Remember It or your account will be lost forever (There is no recovery), Then you should reinstall app to use new account or remove all it's data first.</div>
    </q-card-section>

    <q-card-section>
      <q-form
        @submit="onEncryption"
        @reset="onReset"
        class="q-gutter-md"
        autofocus
      >
      <q-input dense :rules="[val => val.length === 7 || 'Field is required']"
         rounded outlined filled type="text"
          v-model="encryptionPin" autofocus
          mask= "#-#-#-#"
          >
      </q-input>
      <q-card-actions align="right" class="text-primary">
        <q-btn style="cursor: pointer;" flat label="Close" v-close-popup />
        <q-btn type="submit" style="cursor: pointer;" class="bg-primary text-white" label="Encrypt Wallet" />
    </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</q-dialog>
    <!-- <div class="row justify-center">
      <q-btn flat class="bg-green text-white" size="md" label="Create" />
    </div>
    <q-footer>
  <q-toolbar outline class="justify-center bg-cyan-1">
    <div class="row">
      <q-btn flat size="xs" class="bg-blue-5 text-white" label="Code" />
    </div>
  </q-toolbar>
</q-footer> -->
  </q-page>
</template>

<style>
</style>

<script>
import { colors } from 'quasar'

export default {
  name: 'PageIndex',
  data () {
    return {
      importAccountDialog: false,
      insertSeedDialog: false,
      insertPrivateKeyDialog: false,
      privatekey: null,
      seedPhrase: null,
      isPwd: true,
      isSeedPwd: false,
      encryptionPinProvided: false,
      encryptionPin: '',
      showInsertEncryptionPinDialog: true
    }
  },
  mounted () {
    this.showInsertEncryptionPinDialog = true
  },
  methods: {
    async createAccount () {
      if (this.encryptionPinProvided === false) {
        this.showInsertEncryptionPinDialog = true
        return
      }
      let randomWallet = this.$ethers.Wallet.createRandom()
      let cipher = await this.$cryptojs.AES.encrypt(JSON.stringify(randomWallet), this.$q.sessionStorage.getItem('PinEnr')).toString()
      this.$q.localStorage.set('wallet', cipher)
      this.$router.push('home')
    },
    async seedAdded () {
      if (this.encryptionPinProvided === false) {
        this.showInsertEncryptionPinDialog = true
        return
      }
      let seed = this.seedPhrase
      let wallet
      try {
        wallet = new this.$ethers.Wallet.fromMnemonic(seed) //eslint-disable-line
      } catch (err) {
        this.$q.notify({
          color: 'red',
          message: 'Problem adding this Seed.'
        })
        return
      }
      let cipher = await this.$cryptojs.AES.encrypt(JSON.stringify(wallet), this.$q.sessionStorage.getItem('PinEnr')).toString()
      this.$q.localStorage.set('wallet', cipher)
      // let walletWithProvider = new this.$ethers.Wallet(privateKey, this.$etcProvider)
      // // console.log(walletWithProvider)

      this.$router.push('home')
      // console.log(wallet)
    },
    async keyAdded () {
      if (this.encryptionPinProvided === false) {
        this.showInsertEncryptionPinDialog = true
        return
      }
      // ask permission that saved wallet will be deleted
      let privateKey = this.privatekey
      let wallet
      try {
        wallet = new this.$ethers.Wallet(privateKey)
      } catch (err) {
        this.$q.notify({
          color: 'red',
          message: 'Problem adding this private key.'
        })
        return
      }
      let cipher = await this.$cryptojs.AES.encrypt(JSON.stringify(wallet), this.$q.sessionStorage.getItem('PinEnr')).toString()
      this.$q.localStorage.set('wallet', cipher)
      // let walletWithProvider = new this.$ethers.Wallet(privateKey, this.$etcProvider)
      // // console.log(walletWithProvider)

      this.$router.push('home')
      // console.log(wallet)
    },
    onEncryption () {
      // console.log(this.encryptionPin.length)
      let pin = this.encryptionPin.trim().replace(/-/g, '')
      this.$q.sessionStorage.set('PinEnr', pin)
      this.encryptionPinProvided = true
      this.showInsertEncryptionPinDialog = false
      if (this.$q.localStorage.getItem('wallet')) {
        this.$router.push('home')
      }
    },
    onReset () {
      // console.log('hello reset')
    },
    openUrl (url) {
      let win = window.open(url, '_blank')
      win.focus()
    }
  }
}
colors.setBrand('green', '#62d165')
</script>
