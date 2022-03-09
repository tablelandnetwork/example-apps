let testErr = null;

module.exports = {
  connect: async function () {
    await new Promise(resolve => {
      setTimeout(() => resolve(void 0), 500);
    });

    if (testErr) {
      const err = testErr;
      testErr = null;
      throw err;
    }

    return {
      token: {},
      network: '',
      host: '',
      signer: {
        getAddress: async function () {
          return 'testaddress';
        }
      },
      list: async function () {
        if (testErr) {
          const err = testErr;
          testErr = null;
          throw err;
        }

        return [
          {
            "controller": "0x03cA05928aC3179c20Ae6541376Fd6B6E6ed92Cd",
            "name": "brave_joe_87",
            "description": "",
            "structure": "ef7be01282ea97380e4d3bbcba6774cbc7242c46ee51b7e611f1efdfa3623e53",
            "created_at": "2022-02-17T19:18:47.213148Z"
          },
          {
            "controller": "0x03cA05928aC3179c20Ae6541376Fd6B6E6ed92Cd",
            "name": "brave_joe_1112_88",
            "description": "",
            "structure": "ef7be01282ea97380e4d3bbcba6774cbc7242c46ee51b7e611f1efdfa3623e53",
            "created_at": "2022-02-17T19:31:41.76724Z"
          },
          {
            "controller": "0x03cA05928aC3179c20Ae6541376Fd6B6E6ed92Cd",
            "name": "todo_app_example__03ca0592_89",
            "description": "",
            "structure": "7837fa79ed5151d99da5051b41d7387e7c249a2b0321d440138c81108160cdd9",
            "created_at": "2022-02-17T19:33:16.702406Z"
          }
        ];
      },
      query: async function (query) {
        if (testErr) {
          const err = testErr;
          testErr = null;
          throw err;
        }

        if (query === 'readquery1') {
          return {
            data: {
                columns: [
                    {
                        name: 'complete'
                    },
                    {
                        name: 'name'
                    },
                    {
                        name: 'deleted'
                    },
                    {
                        name: 'id'
                    }
                ],
                rows: [
                    [
                        false,
                        'Explore Tableland',
                        false,
                        1
                    ],
                    [
                        false,
                        'Join Tableland Discord',
                        false,
                        2
                    ],
                    [
                        false,
                        'Build web3 with SQL!',
                        false,
                        3
                    ]
                ]
            }
          };
        }

        if (query === 'updatequery1') {
          return {
            data: null
          };
        }

        return {};
      },
      create: async function () {
        if (testErr) {
          const err = testErr;
          testErr = null;
          throw err;
        }

        return {
            name: "unittests_180"
        };
      }
    };
  },
  nextError: function (err) {
    console.log('nextError ' + err);
    testErr = err;
  }
};
