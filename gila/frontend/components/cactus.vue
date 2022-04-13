<template>
  <div class="w-full">
    <div v-if="loading" class="w-full h-96 mt-16 text-center">
      <ProgressSpinner />
    </div>

    <div v-if="!loading">
      <Dialog :modal="true" v-model:visible="writingTweet" >
        <template #header>
          <h3>Write a Tweet:</h3>
        </template>

        <Textarea v-if="!sendingTweet" v-model.trim="tweetText" :autoResize="true" rows="5" cols="30" />
        <i v-if="sendingTweet" class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>

        <template #footer>
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" :disabled="sendingTweet" @click="writingTweet = false" />
          <Button label="Send It!" icon="pi pi-check" autofocus :disabled="!tweetText || sendingTweet" @click="sendTweet" />
        </template>
      </Dialog>

      <div class="w-3/4 mx-auto mt-16 flex justify-between">
        <div>
          <h5>Find Accounts to follow</h5>
          <AutoComplete
            v-model="searchVal"
            :suggestions="$store.searchedAccounts"
            field="user_address"
            @complete="searchAccounts($event)"
            :delay="722"
            @item-select="followAccount($event)"
          />
        </div>

        <div class="py-2">
          <Button label="Tweet " icon="pi pi-plus" class="p-button-rounded" @click="writingTweet = true" />
        </div>
      </div>
      <Card v-for="tweet in $store.myTweets" class="w-3/4 mx-auto my-16">
        <template #title>
          <i class="pi pi-user mr-2 float-left" style="font-size: 2rem"></i>
          {{ tweet.username }} <i class="pi pi-pencil" @click="openNickname(tweet)"></i>
          <span style="font-size: 0.7rem; font-weight: 200; " class="float-right">{{ $date(tweet.created_at) }}</span>
        </template>
        <template #content>
          <p>
            {{ tweet.tweet }}
          </p>
        </template>
      </Card>

      <Dialog :modal="true" v-model:visible="editingNickname" >
        <template #header>
          <h3 class="text-xl font-bold">Assign a nickname:</h3>
        </template>

        <p class="mb-4">You can assign a nickname to each address. You will be the only one who sees the nickname.</p>

        <template #footer>
          <InputText v-model.trim="nicknameVal" class="float-left w-3/5" />
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" :disabled="sendingTweet" @click="closeNickname" />
          <Button label="Submit" icon="pi pi-check" autofocus @click="updateNickname" />
        </template>
      </Dialog>
    </div>
  </div>
</template>

<script lang="ts">

import { mapStores } from 'pinia';
import { store } from '../store/index';

export default {
  data() {
    return {
      loading: false,

      writingTweet: false,
      sendingTweet: false,
      searching: null,
      searchVal: null,
      tweetText: '',

      nicknameVal: '',
      nicknameTweet: null,
      editingNickname: false
    };
  },
  computed: {
    ...mapStores(store)
  },
  methods: {
    sendTweet: async function () {
      if (!this.tweetText) return;

      try {
        this.sendingTweet = true;

        await this.$store.tweet({
          tweet: this.tweetText
          // reploy to etc...
        });

        this.sendingTweet = false;
        this.writingTweet = false;
        this.tweetText = '';
      } catch (err) {
        this.$store.alert(err.message);
        this.sendingTweet = false;
      }
    },
    openNickname: function (tweet) {
      this.nicknameTweet = tweet;
      this.nicknameVal = tweet.nickname || tweet.account_address;
      this.editingNickname = true;
    },
    closeNickname: function () {
      this.nicknameTweet = null;
      this.nicknameVal = '';
      this.editingNickname = false;
    },
    updateNickname: async function () {
      try {
        const tweet = this.nicknameTweet;
        this.loading = true;

        await this.$store.updateNickname({
          newNickname: this.nicknameVal,
          account_address: tweet.account_address,
          oldNickname: tweet.nickname
        });

        this.closeNickname();

        await this.$store.getFeed();

        this.loading = false;
      } catch (err) {
        this.nicknameVal = '';
        this.$store.alert(err.message);
      }
    },
    searchAccounts: async function (eve) {
      const addr = eve.query

      await this.$store.findFollowers(addr);
    },
    followAccount: async function (eve) {
      const account = eve.value;

      this.searchVal = null;

      await this.$store.followAccount(account);
      this.$store.alert({severity: 'success', content: `You are following ${account.user_address}!`});
    }
  }
};

</script>
