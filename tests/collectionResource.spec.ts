import { describe, it } from 'mocha';
import { assert } from 'chai';
import { CollectionResource, Resource } from '../src/hal';

describe("CollectionResource", () => {

    it('Should have embedded resources and pagination links', () => {
        let expected = {
            _links: {
                next: {
                    href: '/orders?page=2&size=5'
                },
                prev: {
                    href: '/orders?page=0&size=5'
                },
                self: { href: '/orders?page=1&size=5' },
            },
            page: 1,
            size: 5,
            total: 25,
            derp: "awef",
            _embedded: {
                orders: [
                    {
                        _links: {
                            self: { href: '/orders/1' }
                        },
                        id: 1,
                    },
                    {
                        _links: {
                            self: { href: '/orders/2' }
                        },
                        id: 2
                    },
                    {
                        _links: {
                            self: { href: '/orders/3' }
                        },
                        id: 3,
                    },
                    {
                        _links: {
                            self: { href: '/orders/4' }
                        },
                        id: 4
                    },
                    {
                        _links: {
                            self: { href: '/orders/5' }
                        },
                        id: 5
                    },
                ]
            }
        }

        let embeddedResources = [
            new Resource({ id: 1 }, '/orders/1'),
            new Resource({ id: 2 }, '/orders/2'),
            new Resource({ id: 3 }, '/orders/3'),
            new Resource({ id: 4 }, '/orders/4'),
            new Resource({ id: 5 }, '/orders/5'),
        ]

        let collectionResource = new CollectionResource({
            embedded: embeddedResources,
            rel: 'orders',
            uri: '/orders',
            props: {
                total: 25,
                size: 5,
                page: 1,
                derp: 'awef'
            }
        })

        assert.deepEqual(collectionResource.toRaw(), expected);
    })

    it('Should not have prev link', () => {
        let expected = {
            _links: {
                next: {
                    href: '/orders?page=1&size=5'
                },
                self: { href: '/orders?page=0&size=5' },
            },
            page: 0,
            size: 5,
            total: 25,
            derp: "awef",
            _embedded: {
                orders: [
                    {
                        _links: {
                            self: { href: '/orders/1' }
                        },
                        id: 1,
                    },
                    {
                        _links: {
                            self: { href: '/orders/2' }
                        },
                        id: 2
                    },
                    {
                        _links: {
                            self: { href: '/orders/3' }
                        },
                        id: 3,
                    },
                    {
                        _links: {
                            self: { href: '/orders/4' }
                        },
                        id: 4
                    },
                    {
                        _links: {
                            self: { href: '/orders/5' }
                        },
                        id: 5
                    },
                ]
            }
        }

        let embeddedResources = [
            new Resource({ id: 1 }, '/orders/1'),
            new Resource({ id: 2 }, '/orders/2'),
            new Resource({ id: 3 }, '/orders/3'),
            new Resource({ id: 4 }, '/orders/4'),
            new Resource({ id: 5 }, '/orders/5'),
        ]

        let collectionResource = new CollectionResource({
            embedded: embeddedResources,
            rel: 'orders',
            uri: '/orders',
            props: {
                total: 25,
                size: 5,
                page: 0,
                derp: 'awef'
            }
        })

        assert.deepEqual(collectionResource.toRaw(), expected);
    })

    it('Should not have next link', () => {
        let expected = {
            _links: {
                prev: {
                    href: '/orders?page=3&size=5'
                },
                self: { href: '/orders?page=4&size=5' },
            },
            page: 4,
            size: 5,
            total: 25,
            derp: "awef",
            _embedded: {
                orders: [
                    {
                        _links: {
                            self: { href: '/orders/1' }
                        },
                        id: 1,
                    },
                    {
                        _links: {
                            self: { href: '/orders/2' }
                        },
                        id: 2
                    },
                    {
                        _links: {
                            self: { href: '/orders/3' }
                        },
                        id: 3,
                    },
                    {
                        _links: {
                            self: { href: '/orders/4' }
                        },
                        id: 4
                    },
                    {
                        _links: {
                            self: { href: '/orders/5' }
                        },
                        id: 5
                    },
                ]
            }
        }

        let embeddedResources = [
            new Resource({ id: 1 }, '/orders/1'),
            new Resource({ id: 2 }, '/orders/2'),
            new Resource({ id: 3 }, '/orders/3'),
            new Resource({ id: 4 }, '/orders/4'),
            new Resource({ id: 5 }, '/orders/5'),
        ]

        let collectionResource = new CollectionResource({
            embedded: embeddedResources,
            rel: 'orders',
            uri: '/orders',
            props: {
                total: 25,
                size: 5,
                page: 4,
                derp: 'awef'
            }
        })

        assert.deepEqual(collectionResource.toRaw(), expected);
    })

    it('Should expand uri template', function() {
        let expected = {
            _links: {
                next: { href: "/customer/12345/orders?sort=oldest&page=3&size=10" },
                prev: { href: "/customer/12345/orders?sort=oldest&page=1&size=10" },
                self: { href: "/customer/12345/orders?sort=oldest&page=2&size=10" }
            },
            page: 2,
            size: 10,
            total: 100,
            _embedded: {
                orders: []
            }
        };

        let resource = new CollectionResource({
            embedded: [],
            rel:'orders',
            uri: '/customer/{id}/orders{?sort}',
            uriTemplateParams: {
                id: 12345,
                sort: "oldest"
            },
            props: {
                total: 100,
                size: 10,
                page: 2
            }
        })
        assert.deepEqual(expected, resource.toRaw());
    })
})