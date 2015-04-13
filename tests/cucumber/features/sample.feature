Feature: Submit form, convert and validate

  As a user
  I want forms to be only submitted when validation passed
  So that we don't save wrong data

  Scenario:
    Given I am on the home page
    When I navigate to "/"
    Then I should see the title of "sample-app"
    When I submit the empty form
    Then I should get validation errors
    Then Stay where we are
