<template>
  <q-page padding style="background-image: linear-gradient(white, #2296f3);">
    <div class="row justify-center q-mt-xl">
      <q-btn class="text-green" style="width:80vw" @click="createAccount()" outline align="left" rounded icon="add_circle_outline" label="Create new account" />
    </div>
    <div class="row justify-center q-mt-md">
      <q-btn class="text-green" style="width:80vw" @click="importAccountDialog=true" outline rounded align="left" icon="account_circle" label="Import old account" />
    </div>
    <div class="row justify-center q-mt-xl">
      <q-btn class="text-black q-mt-md" style="width:60vw" outline rounded align="left" icon="info_outline" label="Help Airdrop" />
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn class="text-black" style="width:60vw" outline rounded align="left" icon="info_outline" label="Help Wiki" />
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn class="text-black" style="width:60vw" outline rounded align="left" icon="info_outline" label="P3C Website" />
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn class="text-black" style="width:60vw" outline rounded align="left" icon="info_outline" label="P3C Trade" />
    </div>

    <q-dialog v-model="importAccountDialog" persistent>
   <q-card>
     <q-card-section class="row items-center justify-center">
       <q-avatar icon="account_circle" color="primary" text-color="white" />
       <span class="q-ml-sm">Your existing account in this wallet (if any exists) will be deleted,
         Make sure to save it's seed or private keys before moving forward with this operation.
       How would you like to import your account?</span>
     </q-card-section>

     <q-card-actions align="right">
       <q-btn flat label="Seed" @click="insertSeedDialog=true" color="primary" v-close-popup />
       <q-btn flat label="Private Key" @click="insertPrivateKeyDialog=true" color="primary" v-close-popup />
     </q-card-actions>
   </q-card>
 </q-dialog>
 <!-- Dialog for inserting private key -->
 <q-dialog v-model="insertPrivateKeyDialog" persistent>
  <q-card style="min-width: 300px">
    <q-card-section>
      <div class="text-h6">Your Private Key for Existing Wallet.</div>
    </q-card-section>

    <q-card-section>
      <q-input dense :rules="[val => !!val || 'Field is required']"
         rounded outlined filled :type="isPwd ? 'password' : 'text'"
          v-model="privatekey" autofocus />
    </q-card-section>

    <q-card-actions align="right" class="text-primary">
      <q-btn flat label="Close" v-close-popup />
      <q-btn flat label="Add Wallet" @click="keyAdded()" v-close-popup />
    </q-card-actions>
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
      isPwd: true
    }
  },
  mounted () {
    if (this.$q.localStorage.getItem('wallet')) {
      this.$router.push('home')
    }
  },
  methods: {
    createAccount () {
      if (!this.$q.localStorage.getItem('wallet')) {
        let randomWallet = this.$ethers.Wallet.createRandom()
        this.$q.localStorage.set('wallet', randomWallet)
        this.$router.push('home')
      } else {
        this.$router.push('home')
      }
    },
    keyAdded () {
      // ask permission that saved wallet will be deleted
      let privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123'
      let wallet = new this.$ethers.Wallet(privateKey)
      // let walletWithProvider = new this.$ethers.Wallet(privateKey, this.$etcProvider)
      // console.log(walletWithProvider)
      console.log(wallet)
    }
  }
}
colors.setBrand('green', '#62d165')
</script>
