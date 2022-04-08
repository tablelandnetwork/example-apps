<template>
  <div class="container mx-auto">

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

    <div class="w-3/4 mx-auto mt-16 grid justify-items-end">
      <Button label="Tweet" icon="pi pi-plus" class="p-button-rounded" @click="writingTweet = true" />
    </div>
    <Card v-for="tweet in tweets" class="w-3/4 mx-auto my-16">
      <template #title>
        <i class="pi pi-user mr-2" style="font-size: 2rem"></i> {{ tweet.nickname }}
        <span style="font-size: 0.7rem; font-weight: 200; " class="float-right">{{ tweet.created_at }}</span>
      </template>
      <template #content>
        <p>
          {{ tweet.tweet }}
        </p>
      </template>
    </Card>
  </div>
</template>

<script lang="ts">

export default {
  data() {
    return {
      writingTweet: false,
      sendingTweet: false,
      tweetText: '',
      tweets: [
        {
          tweet: 'When we seek to understand water on earth there are two types of variables, units of time and units of water. Combining the units helps us quantify water: Gallons per minute, acre-feet per year, cubic-feet per second, inches per hour, etc.',
          nickname: 'Mustalic Buetlon',
          created_at: new Date('2022-02-22T22:22:22.222Z')
        }, {
          tweet: 'Barring Hindenburg style contraptions and catastrophes, it is not possible to create or destroy water. Unlike wealth, when we combine water and time, we do not get more or less water. Water is a net-zero resource. ',
          nickname: 'Cristiano Bieber',
          created_at: new Date('2022-02-22T22:22:22.222Z')
        }, {
          tweet: 'There is a reason why The Almond Board has funded 239 water research projects and counting. It is the same reason California households have $1 billion in unpaid water bills. It is the same reason forecasts are predicting over half a million acres of farmland will need to be fallowed in the San Joaquin valley. The reason is that the forgotten property of water, its net-zero nature, is being realized.',
          nickname: 'Narendra Gaga',
          created_at: new Date('2022-02-22T22:22:22.222Z')
        }
      ]
    };
  },
  methods: {
    initTweet: function () {

    },
    sendTweet: async function () {
      this.sendingTweet = true
      setTimeout(() => {
        this.tweets.unshift({
          tweet: this.tweetText,
          nickname: 'It\'s Me!',
          created_at: new Date()
        });
        this.writingTweet = false;
        this.sendingTweet = false;
        this.tweetText = '';
      }, 3370);
    }
  }
};

</script>
