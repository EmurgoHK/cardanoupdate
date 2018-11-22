import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import { Projects } from '../projects/projects'
import { Comments } from '../comments/comments'
export const isModerator = userId => {
  let user = Meteor.users.findOne({
    _id: userId
  })

  return user && user.moderator
}

export const userStrike = new ValidatedMethod({
  name: 'userStrike',
  validate: new SimpleSchema({
    userId: {
      type: String,
      optional: false
    },
    type: {
      type: String,
      optional: false
    },
    token: {
      type: String,
      optional: false
    },
    times: {
      type: Number
    }
  }).validator({
    clean: true
  }),
  run({ userId, type, token, times}) {
    times = times || 1

    if (token !== 's3rv3r-only') {
      throw new Meteor.Error('Error.', 'Server-side only method.')
    }

    let user = Meteor.users.findOne({
      _id: userId
    })

    if (!user) {
      throw new Meteor.Error('Error.', 'User doesn\'t exist.')
    }

    Meteor.users.update({
      _id: user._id
    }, {
      $push: {
        strikes: {
          time: new Date().getTime(),
          type: type
        }
      }
    })

    let lastWeek = new Date().getTime() - 24 * 60 * 60 * 1000 * 7 // one week
    let strikesWeek = user.strikes ? user.strikes.reduce((i1, i2) => i1 + (i2.time > lastWeek ? 1 : 0), 0) + times : times

    let lastMonth = new Date().getTime() - 24 * 60 * 60 * 1000 * 30 // one month (30 days average)
    let strikesMonth = user.strikes ? user.strikes.reduce((i1, i2) => i1 + (i2.time > lastMonth ? 1 : 0), 0) + times : times

    if (strikesWeek > 3 || strikesMonth > 6) {
      Meteor.users.update({
        _id: userId
      }, {
        $set: {
          suspended: true
        }
      })
    }
  }
})

export const applyForPardon = new ValidatedMethod({
  name: 'applyForPardon',
  validate: new SimpleSchema({
    reason: {
      type: String,
      optional: false
    }
  }).validator({
    clean: true
  }),
  run({
    reason
  }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'You have to be logged in.')
    }

    Meteor.users.update({
      _id: Meteor.userId()
    }, {
      $set: {
        pardon: {
          reason: reason,
          status: 'new'
        }
      }
    })
  }
})

export const pardonVote = new ValidatedMethod({
  name: 'pardonVote',
  validate: new SimpleSchema({
    userId: {
      type: String,
      optional: false
    },
    type: {
      type: String,
      optional: false
    }
  }).validator({
    clean: true
  }),
  run({
    userId,
    type
  }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'You have to be logged in.')
    }

    if (!isModerator(Meteor.userId())) {
      throw new Meteor.Error('Error.', 'You have to be a moderator.')
    }

    let u = Meteor.users.findOne({
      _id: userId
    })

    if (!u) {
      throw new Meteor.Error('Error.', 'User doesn\'t exist.')
    }

    if (!(u.pardon.votes || []).filter(i => i.userId === Meteor.userId()).length) {
      Meteor.users.update({
        _id: u._id
      }, {
        $inc: {
          'pardon.score': type === 'voteUp' ? 1 : -1, // increase or decrease the current score
          [`pardon.${type === 'voteUp' ? 'upvotes' : 'downvotes'}`]: 1 // increase upvotes or downvotes
        },
        $push: {
          'pardon.votes': {
            userId: Meteor.userId(),
            type: type,
            time: new Date().getTime()
          }
        }
      })
    }

    let approveChange = Meteor.users.find({
      _id: u._id
    }, {
      fields: {
        pardon: 1
      }
    }).fetch()[0]

    if (approveChange.pardon.score >= 3) {
      Meteor.users.update({
        _id: u._id
      }, {
        $set: {
          pardon: {
            status: 'granted'
          },
          strikes: [], // clear his sins
          suspended: false
        }
      })

      return
    }

    if (approveChange.pardon.score <= -3) {
      Meteor.users.update({
        _id: u._id
      }, {
        $set: {
          pardon: {
            status: 'denied'
          }
        }
      })

      return
    }
  }
})

export const possibleModerators = new ValidatedMethod({
  name: 'possibleModerators',
  validate: new SimpleSchema({}).validator({
    clean: true
  }),
  run({}) {
    let possible = []
    let notPossible = []

    Meteor.users.find({}).fetch().forEach(i => {
      let strikes = (i.strikes || []).filter(i => i.time > (new Date().getTime() - 1000 * 60 * 60 * 24 * 30))

      if (!i.suspended && !i.moderator && strikes.length === 0) { // three requirements, user is not suspended, user is not a moderator, and the user has no strikes in the last 30 days
        let projects = Projects.find({
          createdBy: i._id
        }).count()
        
        let comments = Comments.find({
          createdBy: i._id
        }).count()

        possible.push({
          _id: i._id,
          totalInput: projects + comments,
        })
      } else {
        notPossible.push({
          _id: i._id
        })
      }
    })

    let maxTotalInput = possible.reduce((i1, i2) => i2.totalInput > i1 ? i2.totalInput : i1, 0) || 1

    possible = possible.map(i => _.extend(i, {
      rating: (i.totalInput / maxTotalInput)
    })).sort((i1, i2) => {
      return i2.rating - i1.rating
    })

    possible.forEach((i, ind) => {
      Meteor.users.update({
        _id: i._id
      }, {
        $set: {
          'mod.data': _.extend(_.omit(i, '_id'), {
            rank: ind + 1
          })
        }
      })
    }) // save data for all possible moderators

    notPossible.forEach((i, ind) => {
      Meteor.users.update({
        _id: i._id
      }, {
        $unset: { 'mod.data': 1 }
      })
    }) // reset data for all not possible moderators

    possible = possible.slice(0, Math.ceil(possible.length * 0.1)) // top 10%

    Meteor.users.update({
      'mod.candidate': true
    }, {
      $set: {
        'mod.candidate': false
      }
    }) // reset all flags before

    possible.forEach(i => { // set the flag for all candidates
      Meteor.users.update({
        _id: i._id
      }, {
        $set: {
          'mod.candidate': true
        }
      })
    })
  }
})

export const promoteUser = new ValidatedMethod({
  name: 'promoteUser',
  validate: new SimpleSchema({
    userId: {
      type: String,
      optional: false
    }
  }).validator({
    clean: true
  }),
  run({
    userId
  }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'You have to be logged in.')
    }

    if (!isModerator(Meteor.userId())) {
      throw new Meteor.Error('Error.', 'You have to be a moderator.')
    }

    let user = Meteor.users.findOne({
      _id: userId
    })

    if (!user) {
      throw new Meteor.Error('Error.', 'Invalid user.')
    }

    Meteor.users.update({
      _id: user._id
    }, {
      $set: {
        'mod.approved': true,
        'mod.time': new Date().getTime(),
        moderator: true
      }
    })
  }
})

if (Meteor.isDevelopment) {
  Meteor.methods({
    generateTestCandidate: () => {
      Meteor.users.insert({
        profile: {
          name: 'TestCandidate'
        },
        mod: {
          candidate: true,
          data: {
            rating: 1,
            totalInput: 100,
            rank: 1
          }
        }
      })
    },
    removeTestCandidate: () => {
      Meteor.users.remove({
        'profile.name': 'TestCandidate'
      })
    },
    generateTestPardon: () => {
      Meteor.users.insert({
        profile: {
          name: 'TestPardon'
        },
        strikes: [{
          type: 'news',
          time: new Date().getTime()
        }],
        pardon: {
          reason: 'Test',
          status: 'new'
        }
      })
    },
    removeTestPardon: () => {
      Meteor.users.remove({
        'profile.name': 'TestPardon'
      })
    },
    toggleSuspended: () => {
      let user = Meteor.users.findOne({
        _id: Meteor.userId()
      })

      Meteor.users.update({
        _id: Meteor.userId()
      }, {
        $set: {
          suspended: !user.suspended
        }
      })
    },
    generateTestUser: () => {
      let user = Meteor.users.findOne({
        username: 'testing'
      })
      if (!user) {
        let uId = Accounts.createUser({
          username: 'testing',
          password: 'testing',
          email: 'testing@testing.test',
          profile: {
            name: 'Tester'
          }
        });

        Meteor.users.update({
          _id: uId
        }, {
          $set: {
            moderator: true
          }
        })
      }
    }
  })
}

// Edit Profile
export const updateProfile = new ValidatedMethod({
  name: 'updateProfile',
  validate: new SimpleSchema({
    uId: {
      type: String,
      optional: false
    },
    name: {
      type: String,
      optional: false
    },
    email: {
      type: String,
      optional: false
    },
    bio: {
      type: String,
      optional: false
    },
    image: {
      type: String,
      optional: true
    }
  }).validator({
    clean: true
  }),
  run({
    uId,
    name,
    email,
    bio,
    image
  }) {
    Meteor.users.update({
      _id: Meteor.userId()
    }, {
      $set: {
        'profile.name': name,
        'profile.bio': bio,
        'profile.picture': image,
        'emails.0.address': email
      }
    }, {
      upsert: true
    })
  }
})

// User Stats
Meteor.methods({
  signedUpLastMonth: () => {
    return Meteor.users.find({}).fetch().filter(i => new Date(i.createdAt) > (new Date().getTime() - 1000*60*60*24*30) /* 30 days */).length
  },
  commentsLastMonth: () => {
    return Comments.find({}).fetch().filter(i => new Date(i.createdAt) > (new Date().getTime() - 1000*60*60*24*30)).count()
  }
})

// Hide Instruction Modals

export const hideInstructionModal = new ValidatedMethod({
  name: 'hideInstructionModal',
  validate: new SimpleSchema({
    modalId: {
      type: String,
      optional: false
    }
  }).validator({
    clean: true
  }),
  run({ modalId }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'messages.login')
    }
    return Meteor.users.update({
      _id: Meteor.userId()
    }, {
      $addToSet: {
          hidden: modalId
      }
    })
  }
})
