

const _      = require('lodash')
const util   = require('util')
const chalk  = require('chalk')
const config = require('../config')()

class Pagination {

    static async paginate (queryParams, total, moduleOnDashboard) {
        let currentPage
        let paginationDefaults = config.pagination[moduleOnDashboard] // default
        if (!paginationDefaults) {
            paginationDefaults = config.pagination.fallback
        }

        let perPage = paginationDefaults.perPage
		if (queryParams.perPage) {
			perPage = queryParams.perPage
		}

		let page = 0
		if (queryParams.page) {
			currentPage = parseInt(queryParams.page, 10)

			if (currentPage < 0) {
				page = 1
			} else {
                page = currentPage - 1    
            }
		}

		// const skip = (page > 1) ? page * perPage : 0
        const skip = page * perPage

        const showingFrom = skip
        const showingTill = skip + perPage
        console.log(chalk.magenta(`########################## from Pagination #########################`))
        console.log(`paginationDefaults ${util.inspect(paginationDefaults, {depth: null})}`)
        console.log(`page ${page}`)
        console.log(`perPage ${perPage}`)
        console.log(`skip ${skip}`)
        console.log(`total ${total}`)
        const pages = await this.divideIntoPages(total, page, perPage)
        const urlPathWithQuery = await this.formURLfromQueryParams(queryParams, paginationDefaults)
        
        console.log(`urlPathWithQuery ${urlPathWithQuery}`)
        console.log(chalk.magenta(`########################## from Pagination end #########################`))
        return {perPage, currentPage, skip, total, pages, showingFrom, showingTill, urlPathWithQuery}
    }

    static async divideIntoPages (total, currentPage, perPage) {
        // const pages = [{1}, 2, 3, ..., 8, 9, 10] // final result with 1 as active page
        // const pages = [First, 4, 5, ..., 8, 9, 10] // final result with 1 as active page

        const buffer = 8
        let pages = []

        let startPage = currentPage - buffer
        let endPage = currentPage + buffer
        if (startPage < 1) {
            startPage = 1
        } 

        if (currentPage === 1) {
            endPage = currentPage + 8
        }

        let totalPages = Math.round(total/perPage)

        if ((totalPages === 0) || (total <= perPage)) {
            return pages;
        }

        if ((totalPages * perPage) < total) {
            totalPages += 1
        }

        let finalPageReached = false
        for (let i = startPage; (i < endPage && !finalPageReached); i++) {
            if (i <= totalPages) {
                pages.push(i)
            } else if (i === totalPages) {
                finalPageReached = true
            }
        }

        // console.log(chalk.red(`added start pages....`))
        // console.log(`totalPages = ${totalPages}`)
        // console.log(pages)
        // console.log(finalPageReached)
        // if (!finalPageReached) {
        //     for (let i = endPage; i < totalPages; i++) {
        //         if (i <= totalPages) {
        //             pages.push(i)
        //             if (i === totalPages) {
        //                 finalPageReached = true
        //             }
        //         }
        //     }
        // }

        // pages = Array.from(new Set(...pages))
        return pages
    }

    static async formURLfromQueryParams (queryParams, paginationDefaults) {
        let urlPathWithQuery = `${paginationDefaults.basePathOnURL}?`
        delete queryParams.page // this will appended on the frontend

        const queries = Object.keys(queryParams)
        const totalQueries = queries.length

        if (totalQueries === 0) {
            return urlPathWithQuery;
        }

        // we will loop through the keys in array so we can control the URL 
        // structure for the last query. This would help url being sent as 
        // /escalations=123&&page=2
        // this happens becuase &page=2 is rendered on the frontend
        let key
        for (let i = 0; i < totalQueries; i++) {
            key = queries[i]
            if (Object.hasOwnProperty.call(queryParams, key)) {
                if (key !== 'page') {
                    if (i === totalQueries - 1) { // last query
                        urlPathWithQuery += `${key}=${queryParams[key]}`
                    } else {
                        urlPathWithQuery += `${key}=${queryParams[key]}`
                    }
                }
            }
        }

        return urlPathWithQuery
    }
}

module.exports = Pagination