const vm = new Vue({
    el: '#vue-instance',
    data() {
        return {
            baseUrl: 'http://localhost:3000', // API url
            searchTerm: '', // Default search term
            searchResults: [], // Displayed search results
            searchDate: '今天新聞',//搜尋日期
            searchCategory: '全部新聞', //搜尋類別
            numHits: null, // Total search results length
            currSearch: null,
            limit: 10,//最多limit筆資料
            skip: 0, //跳過前面skip筆資料
            currPage: 1, // 目前頁面
            countOfPage: 10,
            // form validation
            errors: [],
            email: null,
            subCategory: null
        }
    },
    computed: {
        filteredRows: function () {
            // this.cleanBlanks()
            return this.searchResults;
        },
        pageStart: function () {
            return (this.currPage - 1) * this.countOfPage;
        },
        totalPage: function () {
            return Math.ceil(this.numHits / this.countOfPage);
        }
    },
    async created() {
        this.searchResults = await this.search() // Search for default term
        this.currSearch = null
    },

    methods: {
        checkForm: function (e) {
            console.log(this.subCategory)
            // if (!this.subCategory) {
            //     alert('請選擇訂閱主題')
            //     return
            // }
            this.errors = [];
            if (!this.email) {
                this.errors.push("Email required.");
            } else if (!this.subCategory) {
                this.errors.push("Need to choose a category.");
            } else if (!this.validEmail(this.email)) {
                this.errors.push("Valid email required.");
            }

            if (!this.errors.length) return true;
            // e.preventDefault()
        },
        // 如果用 async validEmail，會無法顯示"Valid email required.
        validEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (re.test(email)) {
                alert("Thank You!\nYou have been signed up for the newsletter.")
                const subCategory = this.subCategory
                const email = this.email
                const response_allresult = axios.get(`${this.baseUrl}/sub`, { params: { email, subCategory } })

                // console.log(response_allresult.data)
            }
            return re.test(email);
        },
        /** Call API to search for inputted term */
        async onSearchInput() {
            // 每次重新搜尋，初始化page到第1頁
            this.currPage = 1;
            this.currSearch = null
            this.searchResults = await this.search()



        },
        // remove blanks
        async cleanBlanks() {
            for (let i = 0; i < this.searchResults.length; i++) {
                this.searchResults[i].title = this.searchResults[i].title.replace(/\s+/g, '')
                this.searchResults[i].content = this.searchResults[i].content.replace(/\s+/g, '')
            }
        },
        // highlights match searchTerm texts
        async highlights() {
            for (let i = 0; i < this.searchResults.length; i++) {
                const boldTagStart = "<em>"
                const boldTagEnd = "</em>"
                let indexof_title = this.searchResults[i].title.indexOf(this.searchTerm)
                let indexof_content = this.searchResults[i].content.indexOf(this.searchTerm)
                let new_index_title
                let new_index_content


                while (indexof_title != -1) {
                    this.searchResults[i].title = this.searchResults[i].title.slice(0, indexof_title) + boldTagStart +
                        this.searchResults[i].title.slice(indexof_title, indexof_title + this.searchTerm.length) + boldTagEnd +
                        this.searchResults[i].title.slice(indexof_title + this.searchTerm.length)
                    new_index_title = indexof_title + boldTagStart.length + this.searchTerm.length + boldTagEnd.length
                    indexof_title = this.searchResults[i].title.indexOf(this.searchTerm, new_index_title)
                }

                while (indexof_content != -1) {
                    this.searchResults[i].content = this.searchResults[i].content.slice(0, indexof_content) + boldTagStart +
                        this.searchResults[i].content.slice(indexof_content, indexof_content + this.searchTerm.length) + boldTagEnd +
                        this.searchResults[i].content.slice(indexof_content + this.searchTerm.length)
                    new_index_content = indexof_content + boldTagStart.length + this.searchTerm.length + boldTagEnd.length
                    indexof_content = this.searchResults[i].content.indexOf(this.searchTerm, new_index_content)
                }

            }
        },
        async search() {
            // 確認總資料筆數
            console.log("test")
            const term = this.searchTerm
            const category = this.searchCategory
            const date = this.searchDate
            const limit = this.limit
            const skip = this.skip
            // console.log('limit:' + limit)
            // console.log('skip:' + skip)
            // 依據日期搜尋全部新聞
            if ((date == '今天新聞' || date == '昨天新聞' || date == '當週新聞' || date == '當月新聞' || date == '2018' || date == '2017' || date == '2016' || date == '2015' || date == '2014') && category == '全部新聞') {
                let response_allresult = await axios.get(`${this.baseUrl}/all_news`, { params: { term, date } })
                this.numHits = response_allresult.data
                let response = await axios.get(`${this.baseUrl}/all_news_search`, { params: { term, date, limit, skip } })
                this.searchResults = response.data
                this.limit = 10
                this.skip = 0
            }
            else {
                console.log(this.numHits)
                let response_allresult = await axios.get(`${this.baseUrl}/`, { params: { term, date, category } })
                this.numHits = response_allresult.data
                console.log(this.numHits)
                let response = await axios.get(`${this.baseUrl}/search`, { params: { term, date, category, limit, skip } })
                this.searchResults = response.data
                console.log(this.searchResults)
                this.limit = 10
                this.skip = 0
            }

            this.cleanBlanks()
            this.highlights()

            return this.searchResults

        },
        async setPage(idx) {
            if (idx <= 0 || idx > this.totalPage) {
                return;
            }
            // console.log(idx)
            console.log('idex:' + idx)
            this.currPage = idx;
            this.limit = this.currPage * 10
            this.skip = this.limit - 10
            this.searchResults = await this.search()

        },
        async setCategory(category) {
            this.searchCategory = category
            // console.log(this.searchCategory)
            this.currPage = 1
            this.searchResults = await this.search()

        },

        async setDate(date) {
            this.searchDate = date
            // console.log(this.searchDate)
            this.currPage = 1
            this.searchResults = await this.search()

        },


    }
})