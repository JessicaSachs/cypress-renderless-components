import RenderlessTagsInput from './RenderlessTagsInput.vue'
import {mount} from 'cypress-vue-unit-test'

const exampleComponent = `
          <div id="app">
              <renderless-tags-input v-model="tags">
                  <div slot-scope="{ tags, addTag, removeTag, inputAttrs, inputEvents }">
                      <input data-cy="input" placeholder="New tag" v-on="inputEvents" v-bind="inputAttrs">
                      <button data-cy="add" type="button" @click="addTag">Add</button>
                      <ul data-cy="tags" v-show="tags.length > 0">
                          <li v-for="tag in tags">
                              <span>{{ tag }}</span>
                              <button data-cy="remove-tag" @click="removeTag(tag)">Remove</button>
                          </li>
                      </ul>
                  </div>
              </renderless-tags-input>
          </div>`

function mountComponent(data) {
  mount({
    template: exampleComponent,
    components: {RenderlessTagsInput},
    data() {
      return data
    }
  })

  cy.get('[data-cy=remove-tag]').as('removeButtons')
  cy.get('[data-cy=tags]').as('todoList')
  cy.get('[data-cy=tags] > *').as('todos')
  cy.get('[data-cy=input]').as('input')
  cy.get('[data-cy=add]').as('add')
}
const wait = time => new Promise(resolve => setTimeout(resolve, time))

describe('RenderlessTagsInput', () => {
  describe('with existing tags in v-model', () => {
    beforeEach(() => {
      const tags = ["tag1", "tag2"]
      cy.wrap(tags).as('tags')
      mountComponent({tags})
    })

    it('shows the tags', () => {
      cy.get('@tags').then(tags => {
        cy.get('@todos').should('have.length', tags.length)
      })
    })

    it('removes the tags on click', () => {
      cy.get('@tags').then(tags => {
        cy.get('@todos').should('contain.text', tags[0])
        cy.get('@removeButtons').first().click()
        cy.get('@todos').should('not.contain.text', tags[0])
        cy.get('@removeButtons').first().click()
        cy.get('@todos').should('not.contain.text', tags[1])
        cy.get('@todoList').should('be.hidden')
      })
    })

    it('lets users add tags using enter key', () => {
      cy.get('@input').type('My new tag{enter}', { delay: 100 })
      cy.get('[data-cy=tags] > *').last().should('contain.text', 'My new tag')
    })

    it('lets users add tags on click', () => {
      cy.get('@input').type('Another new tag', { delay: 100 })
      cy.get('[data-cy=tags] > *').last().should('not.contain.text', 'Another new tag')
      cy.get('@add').click()
      cy.get('[data-cy=tags] > *').last().should('contain.text', 'Another new tag')
    })

    it('prevents duplicate tags from being submitted', () => {
      cy.get('@tags').then(tags => {
        cy.get('@input').type(`${tags[0]}{enter}`, { delay: 100 })
        cy.get('[data-cy=tags] > *').should('have.length', tags.length)
      })
    })

    it('allows tags to be re-entered', () => {
      cy.get('@tags').then(tags => {
        cy.get('@removeButtons').first().click()
        cy.get('@input').type(`${tags[0]}{enter}`, { delay: 100 })
        cy.get('[data-cy=tags] > *').should('have.length', tags.length)
                                    .and('contain.text', tags[0])
      })
    })
  })
})
